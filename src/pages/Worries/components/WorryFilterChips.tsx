import type { WorryListCounts } from '../../../lib/worryListDerive';
import type { WorryListFilter } from '../../../types/worriesList';

interface WorryFilterChipsProps {
  filter: WorryListFilter;
  counts: WorryListCounts;
  onChange: (filter: WorryListFilter) => void;
}

const FILTER_OPTIONS: { value: WorryListFilter; label: string }[] = [
  { value: 'all', label: '전체' },
  { value: 'ongoing', label: '진행 중' },
  { value: 'paused', label: '일시정지' },
  { value: 'pending', label: '결정 대기' },
];

/**
 * 실측: 높이 30(h-7.5), rounded-full, 칩 간 gap-2. 선택 칩은 상태와 무관하게 항상 동일한
 * 그린(bg-[#3e9b48])이다(499:1291/499:1359 스크린샷 크롭 확인 — 상태별로 칩 색이 달라지지 않음).
 */
export function WorryFilterChips({
  filter,
  counts,
  onChange,
}: WorryFilterChipsProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTER_OPTIONS.map((option) => {
        const isSelected = filter === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`h-7.5 cursor-pointer rounded-full px-3 text-[13px] whitespace-nowrap ${
              isSelected
                ? 'bg-[#3e9b48] font-semibold text-white'
                : 'border border-[#dedede] bg-white text-black'
            }`}
          >
            {option.label} {counts[option.value]}
          </button>
        );
      })}
    </div>
  );
}
