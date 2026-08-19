// 소비기록 대시보드 타입 정의 (docs/plans/spending-record.md 참고)

/** 기간 드롭다운 4개 옵션과 1:1 매칭 */
export type RecordPeriod = 'thisMonth' | 'last3Months' | 'lastYear' | 'all';

export interface RecordPeriodOption {
  value: RecordPeriod;
  label: string;
}

export const RECORD_PERIOD_OPTIONS: RecordPeriodOption[] = [
  { value: 'thisMonth', label: '이번 달' },
  { value: 'last3Months', label: '최근 3개월' },
  { value: 'lastYear', label: '최근 1년' },
  { value: 'all', label: '전체' },
];

/** 카테고리별 고민 도넛차트 한 조각 */
export interface CategoryDonutSlice {
  category: string;
  count: number;
  /** 0~100 */
  percent: number;
}

/** 기간별 절약 금액 막대차트 한 막대 (주차/월 라벨 + 해당 구간 절약 금액) */
export interface SavingsBarPoint {
  label: string;
  amount: number;
}
