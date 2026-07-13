import { ChevronDown } from 'lucide-react';
import type { CategoryStat } from '../../../types/home';
import { CategoryStatRow } from './CategoryStatRow';

interface MonthlySummaryCardProps {
  selectedMonth: string;
  stats: CategoryStat[];
}

export function MonthlySummaryCard({
  selectedMonth,
  stats,
}: MonthlySummaryCardProps) {
  return (
    <div className="flex w-full min-w-0 flex-col gap-6 rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-white p-8 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[30px] font-semibold text-black">
          월별 소비 요약
        </h2>
        {/* 확인 완료: 이번 범위는 UI만 정적으로 구현, 실제 클릭 인터랙션은 이후 별도 작업 */}
        <button
          type="button"
          className="flex items-center gap-1 text-[15px] font-medium text-[#666]"
        >
          {selectedMonth}
          <ChevronDown className="h-4 w-4" />
        </button>
      </div>

      <div className="flex flex-col gap-5">
        {stats.map((stat) => (
          <CategoryStatRow key={stat.key} stat={stat} />
        ))}
      </div>
    </div>
  );
}
