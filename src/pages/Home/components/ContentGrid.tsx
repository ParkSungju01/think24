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
    <div className="flex min-w-0 gap-15.5">
      <div className="flex min-w-90 flex-64 flex-col gap-6">
        <SavedAmountCard
          totalSavedAmount={totalSavedAmount}
          monthlySavedAmount={monthlySavedAmount}
          abandonedCount={savedAmountAbandonedCount}
          purchasedCount={savedAmountPurchasedCount}
        />
        <OngoingWorriesCard worries={ongoingWorries} />
      </div>
      {/* 카드 내부 아이콘 원(127px) + 텍스트가 눌리지 않도록 최소 폭 확보 (1024px 부근 대비) */}
      <div className="min-w-75 flex-36">
        <MonthlySummaryCard selectedMonth={selectedMonth} stats={monthlySummary} />
      </div>
    </div>
  );
}
