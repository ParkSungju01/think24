import type { AiAnswer, AiQuestion, AiVerdict } from '../types/newWorry';

// docs/plans/new-worry.md "src/lib 신규/변경 모듈 제안": Edge Function
// ai-generate-questions/ai-generate-verdict를 감싸는 얇은 래퍼.
// 이슈 #48(docs/plans/local-only-migration.md): 로그인 세션이 더 이상 존재하지 않아
// `supabase.functions.invoke()`(JWT 자동 첨부) 대신 `fetch()`로 Edge Function URL을 직접
// POST한다. 이 함수는 더 이상 `@supabase/supabase-js`를 import하지 않는다 — Edge Function은
// `verify_jwt = false`로 바뀌었으므로 Authorization 헤더 없이도 호출이 성공한다.

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

const FUNCTIONS_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function invokeEdgeFunction<T>(
  name: 'ai-generate-questions' | 'ai-generate-verdict',
  body: unknown,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await response.json().catch(() => null);

    if (!response.ok) {
      return {
        data: null,
        error: json?.error ?? `AI 요청에 실패했습니다. (${response.status})`,
      };
    }

    return { data: json as T, error: null };
  } catch (err) {
    console.error(`${name} 호출 실패:`, err);
    return { data: null, error: 'AI 요청에 실패했습니다.' };
  }
}

/**
 * 상품 정보를 바탕으로 AI 질문 5개를 생성한다.
 * 실패 시(네트워크 오류/Edge Function 502 등) questions는 null, error는 사용자에게 보여줄
 * 메시지 문자열이 된다 — 호출부(useNewWorryFlow)가 이 문자열로 에러 토스트 + 재시도 버튼을 띄운다.
 */
export async function generateWorryQuestions(
  input: GenerateWorryQuestionsInput,
): Promise<{ questions: AiQuestion[] | null; error: string | null }> {
  const { data, error } = await invokeEdgeFunction<{
    questions?: AiQuestion[];
    error?: string;
  }>('ai-generate-questions', {
    name: input.name,
    price: input.price,
    category: input.category,
    purchaseUrl: input.purchaseUrl ?? undefined,
  });

  if (error || !data?.questions) {
    return {
      questions: null,
      error: data?.error ?? error ?? 'AI 질문 생성에 실패했습니다.',
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
  const { data, error } = await invokeEdgeFunction<
    Partial<AiVerdict> & { error?: string }
  >('ai-generate-verdict', {
    name: input.name,
    price: input.price,
    category: input.category,
    purchaseUrl: input.purchaseUrl ?? undefined,
    answers: input.answers,
  });

  if (error || !data?.verdict || !data.scores) {
    return {
      verdict: null,
      error: data?.error ?? error ?? 'AI 분석에 실패했습니다.',
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
