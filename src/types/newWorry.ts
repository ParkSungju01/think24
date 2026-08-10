// docs/plans/new-worry.md "src/lib 신규/변경 모듈 제안" — 새 고민 생성 위저드 전반에서
// 공유하는 타입. Edge Function 입출력, useNewWorryFlow 상태, worries insert payload가
// 모두 이 타입들을 함께 사용한다.

/** AI가 생성한 질문 1개. reason은 "AI가 이 질문을 하는 이유" 토글에 노출한다. */
export interface AiQuestion {
  question: string;
  reason: string;
}

/** 질문 스텝에서 사용자가 고른 답변. answer는 고정 3지선다 문구 중 하나 그대로 저장한다. */
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

/** 계획서 확인 완료 4번: 질문마다 고정된 3지선다 옵션(순서 고정) */
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
