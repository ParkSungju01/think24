import { useState } from 'react';
import {
  generateWorryQuestions,
  generateWorryVerdict,
  toVerdictAnswers,
} from '../../lib/aiWorryAssistant';
import { createWorry } from '../../lib/worries';
import { uploadWorryThumbnail } from '../../lib/worryThumbnails';
import type {
  AiAnswer,
  AiQuestion,
  AiVerdict,
  ProductInfoInput,
} from '../../types/newWorry';

export type NewWorryStep =
  | 'productInfo'
  | 'questionLoading'
  | 'questions'
  | 'verdictLoading'
  | 'verdict'
  | 'timerStarted';

const QUESTION_COUNT = 5;

const INITIAL_PRODUCT_INFO: ProductInfoInput = {
  name: '',
  price: null,
  category: '',
  purchaseUrl: '',
  imageFile: null,
};

/**
 * docs/plans/new-worry.md "화면 구성 > 상태/데이터" 그대로의 단일 상태 머신 훅.
 * 스텝 1~4(상품 정보/질문 생성 로딩/질문 응답/판정 로딩)까지는 전부 로컬 상태만 다루고,
 * 스텝 5("24시간 고민 시작하기")에서만 실제 Supabase 쓰기(이미지 업로드 + insert)가 발생한다.
 */
export function useNewWorryFlow(userId: string | undefined) {
  const [step, setStep] = useState<NewWorryStep>('productInfo');
  const [productInfo, setProductInfo] = useState<ProductInfoInput>(
    INITIAL_PRODUCT_INFO,
  );
  const [questions, setQuestions] = useState<AiQuestion[] | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(QUESTION_COUNT).fill(null),
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [verdict, setVerdict] = useState<AiVerdict | null>(null);

  // 확인 완료 3번: AI 호출(질문 생성/판정 생성) 실패는 해당 로딩 스텝에 머무른 채
  // 에러 토스트 + 재시도 버튼으로 노출한다.
  const [aiError, setAiError] = useState<string | null>(null);
  // 확인 완료 5번: insert(이미지 업로드 포함) 실패는 스텝 5(판정 결과)에 머무른 채 에러 토스트만.
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateProductInfo(patch: Partial<ProductInfoInput>) {
    setProductInfo((prev) => ({ ...prev, ...patch }));
  }

  async function requestQuestions() {
    setAiError(null);
    setStep('questionLoading');

    const { questions: generated, error } = await generateWorryQuestions({
      name: productInfo.name,
      price: productInfo.price ?? 0,
      category: productInfo.category,
      purchaseUrl: productInfo.purchaseUrl || null,
    });

    if (error || !generated) {
      setAiError(error ?? 'AI 질문 생성에 실패했습니다.');
      return;
    }

    setQuestions(generated);
    setAnswers(Array(QUESTION_COUNT).fill(null));
    setCurrentQuestionIndex(0);
    setStep('questions');
  }

  // 스텝 1 "다음" — 필수 필드 검증은 ProductInfoStep에서 이미 통과된 뒤에만 호출된다.
  function submitProductInfo() {
    void requestQuestions();
  }

  function retryGenerateQuestions() {
    void requestQuestions();
  }

  function selectAnswer(option: string) {
    setAnswers((prev) => {
      const next = [...prev];
      next[currentQuestionIndex] = option;
      return next;
    });
  }

  async function requestVerdict(finalAnswers: (string | null)[]) {
    if (!questions) return;

    setAiError(null);
    setStep('verdictLoading');

    const answerPairs: AiAnswer[] = questions.map((q, index) => ({
      question: q.question,
      answer: finalAnswers[index] ?? '',
    }));

    const { verdict: generated, error } = await generateWorryVerdict({
      name: productInfo.name,
      price: productInfo.price ?? 0,
      category: productInfo.category,
      purchaseUrl: productInfo.purchaseUrl || null,
      answers: toVerdictAnswers(questions, answerPairs),
    });

    if (error || !generated) {
      setAiError(error ?? 'AI 분석에 실패했습니다.');
      return;
    }

    setVerdict(generated);
    setStep('verdict');
  }

  function goToNextQuestion() {
    if (currentQuestionIndex < QUESTION_COUNT - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
      return;
    }
    // 5번째 질문의 "다음" — 5개 모두 응답 완료 후 판정 요청
    void requestVerdict(answers);
  }

  function retryGenerateVerdict() {
    void requestVerdict(answers);
  }

  function goToPreviousQuestion() {
    if (currentQuestionIndex === 0) {
      setStep('productInfo');
      return;
    }
    setCurrentQuestionIndex((prev) => prev - 1);
  }

  // 스텝 5 "24시간 고민 시작하기"
  async function startTimer() {
    if (!userId || !questions || !verdict || isSubmitting) return;

    setSubmitError(null);
    setIsSubmitting(true);

    let thumbnailUrl: string | null = null;
    if (productInfo.imageFile) {
      const { url, error } = await uploadWorryThumbnail(
        userId,
        productInfo.imageFile,
      );
      if (error) {
        console.error('uploadWorryThumbnail 실패:', error);
        setSubmitError('이미지 업로드에 실패했습니다.');
        setIsSubmitting(false);
        return;
      }
      thumbnailUrl = url;
    }

    const aiAnswers: AiAnswer[] = questions.map((q, index) => ({
      question: q.question,
      answer: answers[index] ?? '',
    }));

    const { error } = await createWorry({
      userId,
      name: productInfo.name,
      price: productInfo.price ?? 0,
      category: productInfo.category,
      purchaseUrl: productInfo.purchaseUrl || null,
      thumbnailUrl,
      aiQuestions: questions,
      aiAnswers,
      aiVerdict: verdict,
    });

    setIsSubmitting(false);

    if (error) {
      console.error('createWorry 실패:', error);
      setSubmitError('고민 등록에 실패했습니다.');
      return;
    }

    setStep('timerStarted');
  }

  return {
    step,
    productInfo,
    updateProductInfo,
    submitProductInfo,
    questions,
    answers,
    currentQuestionIndex,
    selectAnswer,
    goToNextQuestion,
    goToPreviousQuestion,
    verdict,
    aiError,
    retryGenerateQuestions,
    retryGenerateVerdict,
    submitError,
    dismissSubmitError: () => setSubmitError(null),
    isSubmitting,
    startTimer,
  };
}
