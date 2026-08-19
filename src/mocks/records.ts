import type {
  CategoryDonutSlice,
  RecordPeriod,
  SavingsBarPoint,
} from '../types/spendingRecord';

// 소비기록 대시보드 mock 데이터 (`src/mocks/home.ts`와 동일한 컨벤션).
// docs/adr/0003-spending-record-fully-static-mock.md 참고: 이 화면은 Supabase를 전혀 조회하지
// 않고, 로그인한 사용자가 누구든 기간(RecordPeriod) 4개 값에 대응하는 이 정적 데이터셋을
// 그대로 보여준다. "이번 달"은 피그마 실측값 그대로, 나머지 3개는 비슷한 톤의 예시 값이다.

export interface RecordsMockData {
  savingsAmount: number;
  /** 배지에 표시되는 "+N원" 증감치 */
  savingsAmountDiff: number;
  registeredCount: number;
  abandonedCount: number;
  purchasedCount: number;
  categoryDonut: CategoryDonutSlice[];
  /** period === 'all'은 피그마에 변형이 없어 빈 배열(SavingsBarChartCard가 렌더링하지 않음) */
  savingsBarChart: SavingsBarPoint[];
}

export const recordsMockByPeriod: Record<RecordPeriod, RecordsMockData> = {
  thisMonth: {
    savingsAmount: 50_000,
    savingsAmountDiff: 11_000,
    registeredCount: 10,
    abandonedCount: 8,
    purchasedCount: 2,
    categoryDonut: [
      { category: '패션', count: 3, percent: 30 },
      { category: '전자기기', count: 2, percent: 20 },
      { category: '생활용품', count: 2, percent: 20 },
      { category: '뷰티', count: 1, percent: 10 },
      { category: '취미', count: 1, percent: 10 },
      { category: '기타', count: 1, percent: 10 },
    ],
    savingsBarChart: [
      { label: '1주차', amount: 85_000 },
      { label: '2주차', amount: 55_000 },
      { label: '3주차', amount: 20_000 },
      { label: '4주차', amount: 0 },
    ],
  },
  last3Months: {
    savingsAmount: 332_000,
    savingsAmountDiff: 48_000,
    registeredCount: 28,
    abandonedCount: 20,
    purchasedCount: 8,
    categoryDonut: [
      { category: '패션', count: 7, percent: 25 },
      { category: '생활용품', count: 6, percent: 21 },
      { category: '전자기기', count: 5, percent: 18 },
      { category: '식품', count: 4, percent: 14 },
      { category: '뷰티', count: 3, percent: 11 },
      { category: '기타', count: 3, percent: 11 },
    ],
    savingsBarChart: [
      { label: '6월', amount: 180_000 },
      { label: '7월', amount: 220_000 },
      { label: '8월', amount: 152_000 },
    ],
  },
  lastYear: {
    savingsAmount: 1_540_000,
    savingsAmountDiff: 150_000,
    registeredCount: 96,
    abandonedCount: 70,
    purchasedCount: 26,
    categoryDonut: [
      { category: '패션', count: 20, percent: 21 },
      { category: '생활용품', count: 17, percent: 18 },
      { category: '전자기기', count: 15, percent: 16 },
      { category: '식품', count: 13, percent: 14 },
      { category: '뷰티', count: 11, percent: 11 },
      { category: '운동·건강', count: 9, percent: 9 },
      { category: '취미', count: 6, percent: 6 },
      { category: '기타', count: 5, percent: 5 },
    ],
    savingsBarChart: [
      { label: '1월', amount: 120_000 },
      { label: '2월', amount: 95_000 },
      { label: '3월', amount: 140_000 },
      { label: '4월', amount: 110_000 },
      { label: '5월', amount: 175_000 },
      { label: '6월', amount: 180_000 },
      { label: '7월', amount: 220_000 },
      { label: '8월', amount: 152_000 },
      { label: '9월', amount: 165_000 },
      { label: '10월', amount: 130_000 },
      { label: '11월', amount: 145_000 },
      { label: '12월', amount: 218_000 },
    ],
  },
  all: {
    savingsAmount: 3_340_000,
    savingsAmountDiff: 210_000,
    registeredCount: 214,
    abandonedCount: 158,
    purchasedCount: 56,
    categoryDonut: [
      { category: '패션', count: 42, percent: 20 },
      { category: '생활용품', count: 38, percent: 18 },
      { category: '전자기기', count: 33, percent: 15 },
      { category: '식품', count: 29, percent: 13 },
      { category: '뷰티', count: 24, percent: 11 },
      { category: '운동·건강', count: 20, percent: 9 },
      { category: '취미', count: 15, percent: 7 },
      { category: '가구·인테리어', count: 9, percent: 4 },
      { category: '기타', count: 6, percent: 3 },
    ],
    // period === 'all'은 피그마에 막대차트 변형이 없어 빈 배열(SavingsBarChartCard가 null 반환)
    savingsBarChart: [],
  },
};
