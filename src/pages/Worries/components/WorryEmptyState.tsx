import { ListTodo } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../../routes/paths';
import { WorriesHeader } from './WorriesHeader';
import { WorrySummaryCard } from './WorrySummaryCard';
import { WorryFilterChips } from './WorryFilterChips';
import type { WorryListCounts } from '../../../lib/worryListDerive';
import type { WorryListFilter } from '../../../types/worriesList';

interface WorryEmptyStateProps {
  filter: WorryListFilter;
  counts: WorryListCounts;
  onFilterChange: (filter: WorryListFilter) => void;
}

/**
 * docs/plans/worries-list.md 화면 4(499:1516) — worries 전체가 0건이고 필터가 "전체"일 때만
 * 전체 화면으로 교체. 헤더/요약/칩은 그대로 유지(0으로 표시)하고 그 아래를 CTA 안내로 채운다.
 */
export function WorryEmptyState({
  filter,
  counts,
  onFilterChange,
}: WorryEmptyStateProps) {
  return (
    <>
      <WorriesHeader />
      <WorrySummaryCard
        filter={filter}
        totalPendingAmount={0}
        counts={counts}
        mostUrgentView={null}
        isEmpty
      />
      <WorryFilterChips filter={filter} counts={counts} onChange={onFilterChange} />

      <div className="flex flex-col items-center gap-4 pt-6 pb-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#e9f6e4]">
          <ListTodo className="h-7 w-7 text-[#3e9b48]" />
        </div>
        <div className="flex flex-col items-center gap-2">
          <h2 className="text-[18px] font-bold text-black">
            아직 고민이 없어요
          </h2>
          <p className="text-center text-[13px] text-[#666]">
            사고 싶은 물건을 등록하면 AI가 5가지 질문으로
            <br />
            진단해 드려요.
          </p>
        </div>
        <Link
          to={ROUTES.newWorry}
          className="flex h-12.5 w-45 items-center justify-center rounded-[10px] bg-[#3e9b48] font-semibold text-white"
        >
          + 새 고민 생성
        </Link>
      </div>

      <div className="w-full rounded-[14px] bg-[#e9f6e4] p-4">
        <p className="text-[12px] font-semibold text-black">
          이렇게 쓰면 좋아요
        </p>
        <p className="mt-1 text-[12px] text-[#666]">
          장바구니에 담기 전 여기에 먼저 등록해 보세요. 24시간 뒤에 다시
          물어봐 드립니다.
        </p>
      </div>
    </>
  );
}
