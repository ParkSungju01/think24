import type { HomeData } from '../types/home';

// 홈 화면 더미 데이터 (사용자 확인 완료: src/mocks에 분리)
export const homeMock: HomeData = {
  userName: '민지',
  // 사용자 요청: 아직 실사용 데이터가 없는 상태를 보여주기 위해 0으로 통일
  totalSavedAmount: 0,
  monthlySavedAmount: 0,
  savedAmountAbandonedCount: 0,
  savedAmountPurchasedCount: 0,
  // 사용자 요청: 진행 중인 고민 데이터가 아직 없어 빈 배열로 표시 (OngoingWorriesCard의 빈 상태 UI 확인용)
  ongoingWorries: [],
  selectedMonth: '7월',
  monthlySummary: [
    { key: 'registered', label: '등록한 고민', count: 10, diffVsLastMonth: 2 },
    { key: 'abandoned', label: '포기한 상품', count: 6, diffVsLastMonth: 1 },
    { key: 'purchased', label: '구매한 상품', count: 4, diffVsLastMonth: 1 },
  ],
  todayQuote: '필요한 것과 원하는 것을 구분해보세요.',
};
