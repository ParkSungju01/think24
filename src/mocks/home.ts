import type { HomeData } from '../types/home';

// 홈 화면 더미 데이터 (사용자 확인 완료: src/mocks에 분리)
export const homeMock: HomeData = {
  userName: '민지',
  // 사용자 요청: 아직 실사용 데이터가 없는 상태를 보여주기 위해 0으로 통일
  totalSavedAmount: 11111,
  monthlySavedAmount: 11111,
  savedAmountAbandonedCount: 0,
  savedAmountPurchasedCount: 0,
  // 사용자 요청: 진행 중인 고민 데이터가 아직 없어 빈 배열로 표시 (OngoingWorriesCard의 빈 상태 UI 확인용)
  ongoingWorries: [
    {id: "1", name:"피켓", price:1000, remainingSeconds: 10020, progressPercent:70},
    {id: "2", name:"피켓", price:1000, remainingSeconds: 20, progressPercent:90}
  ],
  // selectedMonth는 더 이상 여기 없음: "현재 월"은 목데이터가 아니라 실제 값이어야 하므로
  // HomePage에서 getCurrentMonthLabel()로 런타임 계산해 내려준다 (src/pages/Home/index.tsx 참고)
  monthlySummary: [
    // count가 전부 0인데 증감(diffVsLastMonth)만 남아있는 건 모순이라 0으로 통일
    { key: 'registered', label: '등록한 고민', count: 20, diffVsLastMonth: 1 },
    { key: 'abandoned', label: '포기한 상품', count: 10, diffVsLastMonth: -1 },
    { key: 'purchased', label: '구매한 상품', count: 5, diffVsLastMonth: 3 },
  ],
  // 실제 문구 소스가 아직 없어 빈 문자열로 두고, TodayQuoteCard의 빈 상태 UI가 노출되도록 함
  todayQuote: '',
};
//  id: string;
//   /** 진행 중인 고민(상품)명 */
//   name: string;
//   /** 원 단위 가격 */
//   price: number;
//   /** 상품 썸네일 이미지 경로. 상품 등록 기능이 아직 없어 없으면 placeholder로 대체 */
//   thumbnailUrl?: string;
//   /** 타이머 잔여 시간(초) */
//   remainingSeconds: number;
//   /** 진행률(0~100) */
//   progressPercent: number;