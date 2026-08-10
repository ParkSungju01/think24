// docs/plans/new-worry.md "src/lib 신규/변경 모듈 제안" — 새 고민 생성 위저드 전반에서
// 공유하는 타입. Edge Function 입출력, useNewWorryFlow 상태, worries insert payload가
// 모두 이 타입들을 함께 사용한다.

/**
 * AI가 생성한 질문 1개. reason은 "AI가 이 질문을 하는 이유" 토글에 노출한다.
 * options는 이 질문에 맞춰 AI가 함께 생성한 3지선다 답변 문구(고정 상수가 아니라 질문마다
 * 다르다 — 실배포 후 고정 선택지가 질문과 안 맞는 경우가 많다는 피드백으로 추가됨).
 */
export interface AiQuestion {
  question: string;
  reason: string;
  options: string[];
}

/** 질문 스텝에서 사용자가 고른 답변. answer는 해당 질문의 options 중 사용자가 고른 문구
 * 그대로 저장한다. */
export interface AiAnswer {
  question: string;
  answer: string;
}

export type AiVerdictType = 'necessary' | 'unnecessary';

export interface AiVerdictScore {
  percent: number;
  label: string;
}

export interface AiVerdict {
  verdict: AiVerdictType;
  title: string;
  description: string;
  scores: {
    necessity: AiVerdictScore;
    impulsiveness: AiVerdictScore;
    priceFit: AiVerdictScore;
  };
}

/** 상품 정보 입력 스텝(ProductInfoStep)의 폼 상태 */
export interface ProductInfoInput {
  name: string;
  price: number | null;
  category: string;
  purchaseUrl: string;
  imageFile: File | null;
}

/**
 * 폴백 전용 3지선다 옵션. 원래는 모든 질문에 고정으로 쓰던 옵션이었지만, 실배포 후 AI가
 * 생성한 질문과 안 맞는 경우가 많다는 피드백으로 이제는 AiQuestion.options(질문마다 AI가
 * 직접 생성)를 우선 사용한다. 이 상수는 AI가 options를 3개 채우지 못했을 때만
 * (ai-generate-questions Edge Function의 normalizeOptions와) QuestionStep의 방어 코드에서 쓰인다.
 */
export const QUESTION_ANSWER_OPTIONS = [
  '네, 꼭 필요해요.',
  '있으면 좋을 거 같아요.',
  '잘 모르겠어요.',
] as const;

export type QuestionAnswerOption = (typeof QUESTION_ANSWER_OPTIONS)[number];

/** 계획서 확인 완료 1번: 9개 카테고리, 이 순서 그대로 드롭다운에 노출 */
export const WORRY_CATEGORIES = [
  '가구·인테리어',
  '뷰티',
  '생활용품',
  '식품',
  '운동·건강',
  '전자기기',
  '취미',
  '패션',
  '기타',
] as const;

export type WorryCategory = (typeof WORRY_CATEGORIES)[number];
