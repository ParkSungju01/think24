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
    // 모바일: pb-24로 하단 고정 BottomNav/FAB와 겹치지 않도록 여백 확보 (425px+는 BottomNav가 사라지므로 lg:pb-16으로 복원)
    // 425~999px(lg) 구간은 사이드바가 이미 나타나 여유 폭이 좁으므로 패딩/간격을 중간값으로,
    // 1000px+(xl)부터 기존에 확정된 데스크톱 값(px-10/pt-16/gap-8)을 적용
    <div className="flex max-w-377.75 flex-col gap-4 px-3 pt-6 pb-24 lg:px-4 lg:pt-8 lg:pb-16 xl:gap-8 xl:px-10 xl:pt-16">
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
