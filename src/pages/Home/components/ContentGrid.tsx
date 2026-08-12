import type { HomeData } from '../../../types/home';
import { SavedAmountCard } from './SavedAmountCard';
import { OngoingWorriesCard } from './OngoingWorriesCard';

type ContentGridProps = Pick<
  HomeData,
  | 'totalSavedAmount'
  | 'monthlySavedAmount'
  | 'savedAmountAbandonedCount'
  | 'savedAmountPurchasedCount'
  | 'ongoingWorries'
>;

// 이슈 #39: 폰 프레임 안에서는 항상 모바일 폭이라 xl: 2컬럼 분기를 제거하고 세로 스택만 남겼다
// (docs/plans/landing-phone-refactor.md 2-4). 그 분기 안에서만 노출되던 MonthlySummaryCard는
// 렌더링될 경로가 완전히 사라져 사용을 중단했다(파일 자체 삭제는 부수 정리 커밋에서 처리).
export function ContentGrid({
  totalSavedAmount,
  monthlySavedAmount,
  savedAmountAbandonedCount,
  savedAmountPurchasedCount,
  ongoingWorries,
}: ContentGridProps) {
  return (
    <div className="flex min-w-0 flex-col gap-4">
      <SavedAmountCard
        totalSavedAmount={totalSavedAmount}
        monthlySavedAmount={monthlySavedAmount}
        abandonedCount={savedAmountAbandonedCount}
        purchasedCount={savedAmountPurchasedCount}
      />
      <OngoingWorriesCard worries={ongoingWorries} />
    </div>
  );
}
