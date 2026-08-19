import { useState } from 'react';
import { RecordsHeader } from './components/RecordsHeader';
import { PeriodSavingsCard } from './components/PeriodSavingsCard';
import { WorryCountsCard } from './components/WorryCountsCard';
import { CategoryDonutCard } from './components/CategoryDonutCard';
import { AiAnalysisCard } from './components/AiAnalysisCard';
import { SavingsBarChartCard } from './components/SavingsBarChartCard';
import { recordsMockByPeriod } from '../../mocks/records';
import type { RecordPeriod } from '../../types/spendingRecord';

// HomePage와 동일한 페이지 배경/여백 컨벤션(docs/plans/spending-record.md "화면 구성" 참고).
const containerClassName = 'flex flex-col gap-4 px-3 pt-6 pb-24';

/**
 * 이 화면은 Supabase를 전혀 조회하지 않는다(docs/adr/0003-spending-record-fully-static-mock.md 참고).
 * 로그인한 사용자가 누구든 `RecordPeriod` 4개 값에 대응하는 `recordsMockByPeriod`의 고정
 * 데이터셋을 그대로 골라 보여준다 — 기간 드롭다운 전환은 순수 로컬 상태 전환이라 재조회/재계산이 없다.
 */
export function RecordsPage() {
  const [period, setPeriod] = useState<RecordPeriod>('thisMonth');
  const data = recordsMockByPeriod[period];

  return (
    <div className={containerClassName}>
      <RecordsHeader period={period} onPeriodChange={setPeriod} />
      <PeriodSavingsCard
        period={period}
        savingsAmount={data.savingsAmount}
        savingsAmountDiff={data.savingsAmountDiff}
        abandonedCount={data.abandonedCount}
        purchasedCount={data.purchasedCount}
      />
      <WorryCountsCard
        registeredCount={data.registeredCount}
        abandonedCount={data.abandonedCount}
        purchasedCount={data.purchasedCount}
      />
      <CategoryDonutCard slices={data.categoryDonut} />
      <AiAnalysisCard />
      <SavingsBarChartCard period={period} points={data.savingsBarChart} />
    </div>
  );
}

export default RecordsPage;
