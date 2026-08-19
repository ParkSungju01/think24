import { formatWon } from '../../../utils/format';
import type { WorryListCounts } from '../../../lib/worryListDerive';
import type { WorryListFilter, WorryListView } from '../../../types/worriesList';

interface WorrySummaryCardProps {
  filter: WorryListFilter;
  totalPendingAmount: number;
  counts: WorryListCounts;
  /** all/ongoing 보조문구에 쓰는 "가장 급한 항목" — 해당 필터로 좁혀진 집합 기준 */
  mostUrgentView: WorryListView | null;
  /** 화면 4(전체 0건 빈 목록)에서만 true — 0원 + 회색 처리, 구분선 없는 한 줄 요약으로 축약 */
  isEmpty?: boolean;
}

function formatRemainingLabel(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  return `${hours}시간 ${minutes}분 남음`;
}

/**
 * docs/plans/worries-list.md 실측 스펙 — 헤더/요약/칩: 342×100 실측 → w-full, rounded-[14px],
 * p-4, 기존 SavedAmountCard류와 동일한 카드 셸. 보조문구는 현재 필터에 따라 갈린다.
 */
export function WorrySummaryCard({
  filter,
  totalPendingAmount,
  counts,
  mostUrgentView,
  isEmpty = false,
}: WorrySummaryCardProps) {
  return (
    <div className="rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-white p-4 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)]">
      <p className={`text-[12px] ${isEmpty ? 'text-[#999]' : 'text-[#666]'}`}>
        보류 중인 금액
      </p>
      <p
        className={`mt-1 ${isEmpty ? 'text-[#999]' : 'text-black'}`}
      >
        <span className="text-[28px] font-semibold">
          {formatWon(totalPendingAmount)}
        </span>
        <span className="text-[15px] font-semibold">원</span>
      </p>

      {isEmpty ? (
        <p className="mt-4 text-[12px] text-[#999]">
          진행 0 · 정지 0 · 대기 0
        </p>
      ) : (
        <div className="mt-4 flex items-center justify-between border-t border-[#eee] pt-3 text-[12px]">
          {filter === 'pending' ? (
            <>
              <span className="text-[#666]">⏱ 결정을 기다리는 고민</span>
              <span className="font-bold text-[#e05b4e]">
                {counts.pending}건
              </span>
            </>
          ) : filter === 'paused' ? (
            <>
              <span className="text-[#666]">⏸ 멈춰둔 고민</span>
              <span className="text-black">{counts.paused}건</span>
            </>
          ) : mostUrgentView ? (
            <>
              <span className="min-w-0 truncate text-[#666]">
                ⏱ 가장 급한 건 · {mostUrgentView.worry.name}
              </span>
              <span
                className={`shrink-0 pl-2 font-semibold ${
                  mostUrgentView.status === 'pending'
                    ? 'text-[#e05b4e]'
                    : 'text-[#3e9b48]'
                }`}
              >
                {mostUrgentView.status === 'pending'
                  ? '타이머 종료'
                  : formatRemainingLabel(mostUrgentView.displayRemainingSeconds)}
              </span>
            </>
          ) : (
            <span className="text-[#666]">진행 중인 고민이 없어요</span>
          )}
        </div>
      )}
    </div>
  );
}
