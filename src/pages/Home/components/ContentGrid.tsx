import type { HomeData } from '../../../types/home';
import { SavedAmountCard } from './SavedAmountCard';
import { OngoingWorriesCard } from './OngoingWorriesCard';
import { MonthlySummaryCard } from './MonthlySummaryCard';

type ContentGridProps = Pick<
  HomeData,
  | 'totalSavedAmount'
  | 'monthlySavedAmount'
  | 'savedAmountAbandonedCount'
  | 'savedAmountPurchasedCount'
  | 'ongoingWorries'
  | 'monthlySummary'
> & {
  /** 목데이터가 아니라 HomePage에서 런타임에 계산해 내려주는 현재 월 라벨 */
  selectedMonth: string;
};

export function ContentGrid({
  totalSavedAmount,
  monthlySavedAmount,
  savedAmountAbandonedCount,
  savedAmountPurchasedCount,
  ongoingWorries,
  selectedMonth,
  monthlySummary,
}: ContentGridProps) {
  return (
    // 좌:우 컬럼 폭 비율(원본 836:473 ≈ 64:36)을 유지한 채 유동형으로 늘고 줄어들도록
    // 고정 px 폭 대신 flex-grow 비율(flex-[64]/flex-[36])을 사용
    // 모바일(~424px)과 425~999px(lg) 구간은 세로로 스택(월별 소비 요약 카드는 숨김),
    // 1000px+(xl)부터 기존에 확정된 가로 2컬럼 레이아웃으로 전환
    //
    // 리뷰 재작업(사용자 결정 b): 이 2단 컬럼 분할과 MonthlySummaryCard 노출 시점을 원래 사이드바
    // 전환 기준이던 lg(425px)가 아니라 xl(1000px)로 미뤘다. 사이드바(218px 고정 폭)까지 감안하면
    // 425~999px 구간은 두 컬럼(특히 우측 36% 폭 안에 지름 127px 아이콘이 들어가는 월별 소비 요약
    // 카드)을 욱여넣기엔 폭이 부족해 폰트 크기만 줄여서는 해결되지 않아, 이 구간에서는 모바일과
    // 동일하게 세로 스택 + 월별 소비 요약 카드 숨김을 유지하기로 판단했다(사이드바 자체의 전환
    // 시점 425px은 변경하지 않음). min-w-90/min-w-75(카드 내부 아이콘·텍스트가 눌리지 않기 위한
    // 최소 폭)도 같은 이유로 flex-row가 실제로 적용되는 xl 시점부터 걸면 충분해 md 특례를 없앴다.
    <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:gap-15.5">
      <div className="flex min-w-0 flex-1 flex-col gap-4 xl:min-w-90 xl:flex-64 xl:gap-6">
        <SavedAmountCard
          totalSavedAmount={totalSavedAmount}
          monthlySavedAmount={monthlySavedAmount}
          abandonedCount={savedAmountAbandonedCount}
          purchasedCount={savedAmountPurchasedCount}
        />
        <OngoingWorriesCard worries={ongoingWorries} />
      </div>
      {/* 카드 내부 아이콘 원(127px) + 텍스트가 눌리지 않도록 최소 폭 확보 (1000px부터, 원본과 동일) */}
      <div className="hidden min-w-0 xl:block xl:min-w-75 xl:flex-36">
        <MonthlySummaryCard selectedMonth={selectedMonth} stats={monthlySummary} />
      </div>
    </div>
  );
}
