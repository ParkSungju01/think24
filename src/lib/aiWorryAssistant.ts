import { supabase } from './supabase';
import type { AiAnswer, AiQuestion, AiVerdict } from '../types/newWorry';

// docs/plans/new-worry.md "src/lib 신규/변경 모듈 제안": Edge Function
// ai-generate-questions/ai-generate-verdict를 감싸는 얇은 래퍼. `supabase.functions.invoke`를
// 쓰면 로그인 세션의 JWT가 자동으로 Authorization 헤더에 실려, 각 함수 내부의
// `requireAuthenticatedUser` 검증을 그대로 통과한다.

export interface GenerateWorryQuestionsInput {
  name: string;
  price: number;
  category: string;
  purchaseUrl: string | null;
}

export interface GenerateWorryVerdictInput {
  name: string;
  price: number;
  category: string;
  purchaseUrl: string | null;
  answers: { question: string; reason: string; answer: string }[];
}

/**
 * 상품 정보를 바탕으로 AI 질문 5개를 생성한다.
 * 실패 시(네트워크 오류/Edge Function 502 등) questions는 null, error는 사용자에게 보여줄
 * 메시지 문자열이 된다 — 호출부(useNewWorryFlow)가 이 문자열로 에러 토스트 + 재시도 버튼을 띄운다.
 */
export async function generateWorryQuestions(
  input: GenerateWorryQuestionsInput,
): Promise<{ questions: AiQuestion[] | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke<{
    questions?: AiQuestion[];
    error?: string;
  }>('ai-generate-questions', {
    body: {
      name: input.name,
      price: input.price,
      category: input.category,
      purchaseUrl: input.purchaseUrl ?? undefined,
    },
  });

  if (error || !data?.questions) {
    // error.message는 supabase-js가 만드는 영문 기술 메시지(예: "Failed to send a
    // request to the Edge Function")라 사용자 토스트에 그대로 노출하지 않는다.
    // 우리 Edge Function이 직접 내려준 data.error(한국어)만 신뢰하고, 그 외에는
    // 콘솔에 원인을 남긴 뒤 고정 한국어 메시지로 대체한다.
    if (error) console.error('generateWorryQuestions 실패:', error);
    return {
      questions: null,
      error: data?.error ?? 'AI 질문 생성에 실패했습니다.',
    };
  }

  return { questions: data.questions, error: null };
}

/**
 * 상품 정보 + 5개 질문/답변을 바탕으로 AI 판정을 생성한다.
 */
export async function generateWorryVerdict(
  input: GenerateWorryVerdictInput,
): Promise<{ verdict: AiVerdict | null; error: string | null }> {
  const { data, error } = await supabase.functions.invoke<
    Partial<AiVerdict> & { error?: string }
  >('ai-generate-verdict', {
    body: {
      name: input.name,
      price: input.price,
      category: input.category,
      purchaseUrl: input.purchaseUrl ?? undefined,
      answers: input.answers,
    },
  });

  if (error || !data?.verdict || !data.scores) {
    if (error) console.error('generateWorryVerdict 실패:', error);
    return {
      verdict: null,
      error: data?.error ?? 'AI 분석에 실패했습니다.',
    };
  }

  return { verdict: data as AiVerdict, error: null };
}

/** answers(사용자가 고른 3지선다 값)와 questions(AI가 생성한 질문+이유)를 합쳐
 * ai-generate-verdict 입력 형태(question/reason/answer)로 조립한다. */
export function toVerdictAnswers(
  questions: AiQuestion[],
  answers: AiAnswer[],
): { question: string; reason: string; answer: string }[] {
  return questions.map((q, index) => ({
    question: q.question,
    reason: q.reason,
    answer: answers[index]?.answer ?? '',
  }));
}
