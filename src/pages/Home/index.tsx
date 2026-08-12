import { HomeHeader } from './components/HomeHeader';
import { ContentGrid } from './components/ContentGrid';
import { TodayQuoteCard } from './components/TodayQuoteCard';
import { useHomeData } from './useHomeData';

// 이슈 #39: 폰 프레임 안에서는 항상 모바일 폭이라 lg:/xl: 데스크톱 분기를 제거하고 모바일
// 기준값만 남겼다(docs/plans/landing-phone-refactor.md 2-4). pb-24는 하단 고정 BottomNav/FAB와
// 겹치지 않도록 하는 여백.
const containerClassName = 'flex flex-col gap-4 px-3 pt-6 pb-24';

export function HomePage() {
  const { data, isLoading, error } = useHomeData();

  if (isLoading) {
    return (
      <div className={containerClassName}>
        <p className="text-[15px] font-medium text-[#666]">불러오는 중...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={containerClassName}>
        <p className="text-[15px] font-medium text-[#666]">
          {error ?? '데이터를 불러오지 못했습니다.'}
        </p>
      </div>
    );
  }

  const {
    userName,
    totalSavedAmount,
    monthlySavedAmount,
    savedAmountAbandonedCount,
    savedAmountPurchasedCount,
    ongoingWorries,
    todayQuote,
  } = data;

  return (
    <div className={containerClassName}>
      <HomeHeader userName={userName} />
      <ContentGrid
        totalSavedAmount={totalSavedAmount}
        monthlySavedAmount={monthlySavedAmount}
        savedAmountAbandonedCount={savedAmountAbandonedCount}
        savedAmountPurchasedCount={savedAmountPurchasedCount}
        ongoingWorries={ongoingWorries}
      />
      <TodayQuoteCard quote={todayQuote} />
    </div>
  );
}

export default HomePage;
