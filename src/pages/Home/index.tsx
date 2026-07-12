import { homeMock } from '../../mocks/home';
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
    selectedMonth,
    monthlySummary,
    todayQuote,
  } = homeMock;

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
