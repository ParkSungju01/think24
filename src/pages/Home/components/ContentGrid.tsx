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
  | 'selectedMonth'
  | 'monthlySummary'
>;

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
    <div className="flex gap-[62px]">
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
