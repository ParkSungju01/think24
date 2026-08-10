// 홈 화면 더미 데이터 타입 정의 (docs/plans/home-screen.md 참고)

export interface OngoingWorry {
  id: string;
  /** 진행 중인 고민(상품)명 */
  name: string;
  /** 원 단위 가격 */
  price: number;
  /** 상품 썸네일 이미지 경로. 상품 등록 기능이 아직 없어 없으면 placeholder로 대체 */
  thumbnailUrl?: string;
  /** 타이머 잔여 시간(초). useHomeData 조회 시점 기준 — 정렬/"최대 2개 선정"에만 쓰인다.
   * 화면에 실제로 표시되는 값은 WorryListItem이 아래 createdAt/deadlineAt으로 매초
   * 다시 계산한다(새로고침 없이 실시간으로 줄어들도록, 이슈 실사용 피드백으로 추가). */
  remainingSeconds: number;
  /** 진행률(0~100). remainingSeconds와 마찬가지로 초기 정렬용 — 실시간 표시는 WorryListItem이 재계산 */
  progressPercent: number;
  /** 타이머 시작 시각. 실시간 진행률 재계산에 사용 */
  createdAt: Date;
  /** 타이머 종료 시각. 실시간 잔여 시간 재계산에 사용 */
  deadlineAt: Date;
}

export interface CategoryStat {
  key: 'registered' | 'abandoned' | 'purchased';
  label: string;
  count: number;
  /** 지난 달 대비 증감. 이번 범위는 증가(양수) 케이스만 사용 */
  diffVsLastMonth: number;
}

export interface HomeData {
  userName: string;
  totalSavedAmount: number;
  monthlySavedAmount: number;
  savedAmountAbandonedCount: number;
  savedAmountPurchasedCount: number;
  /** 최대 2개, 타이머 잔여 시간이 짧은 순 정렬 */
  ongoingWorries: OngoingWorry[];
  monthlySummary: CategoryStat[];
  /** 오늘의 소비 한 줄 문구. 없으면 빈 상태 문구로 대체 */
  todayQuote: string | null;
}
