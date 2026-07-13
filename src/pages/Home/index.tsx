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
    // 아주 넓은 모니터에서 카드가 과하게 늘어나지 않도록 원본 콘텐츠 폭(1920-409=1511px) 근처로 상한선을 둠
    <div className="flex max-w-377.75 flex-col gap-8 px-10 py-16">
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
