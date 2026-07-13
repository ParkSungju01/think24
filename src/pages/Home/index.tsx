import { homeMock } from '../../mocks/home';
import { getCurrentMonthLabel } from '../../utils/format';
import { HomeHeader } from './components/HomeHeader';
import { ContentGrid } from './components/ContentGrid';
import { TodayQuoteCard } from './components/TodayQuoteCard';

export function HomePage() {
  const {
    userName,
    totalSavedAmount,
    monthlySavedAmount,
    savedAmountAbandonedCount,
    savedAmountPurchasedCount,
    ongoingWorries,
    monthlySummary,
    todayQuote,
  } = homeMock;

  // 목데이터가 아니라 실제 "현재 월"이어야 해서 렌더링 시점에 계산해 내려준다
  const selectedMonth = getCurrentMonthLabel();

  return (
    <div className="flex flex-col gap-8 px-[72px] py-[64px]">
      <HomeHeader userName={userName} />
      <ContentGrid
        totalSavedAmount={totalSavedAmount}
        monthlySavedAmount={monthlySavedAmount}
        savedAmountAbandonedCount={savedAmountAbandonedCount}
        savedAmountPurchasedCount={savedAmountPurchasedCount}
        ongoingWorries={ongoingWorries}
        selectedMonth={selectedMonth}
        monthlySummary={monthlySummary}
      />
      <TodayQuoteCard quote={todayQuote} />
    </div>
  );
}

export default HomePage;
