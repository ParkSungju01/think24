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
    <div className="flex gap-15.5">
      <div className="flex w-[836px] shrink-0 flex-col gap-6">
        <SavedAmountCard
          totalSavedAmount={totalSavedAmount}
          monthlySavedAmount={monthlySavedAmount}
          abandonedCount={savedAmountAbandonedCount}
          purchasedCount={savedAmountPurchasedCount}
        />
        <OngoingWorriesCard worries={ongoingWorries} />
      </div>
      <MonthlySummaryCard selectedMonth={selectedMonth} stats={monthlySummary} />
    </div>
  );
}
