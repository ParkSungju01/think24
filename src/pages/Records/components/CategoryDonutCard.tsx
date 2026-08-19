import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import type { CategoryDonutSlice } from '../../../types/spendingRecord';

interface CategoryDonutCardProps {
  slices: CategoryDonutSlice[];
}

/** 9개 카테고리가 등장할 수 있는 만큼, 초록 계열 명도 단계를 9개 준비해 건수 내림차순으로 배정한다.
 * 피그마 도넛은 래스터 플레이스홀더라 카테고리별 고정 색상 지정은 없었음(계획 문서 확인 완료). */
const DONUT_COLORS = [
  '#2f7d38',
  '#3e9b48',
  '#4fae52',
  '#629f41',
  '#7ccf8a',
  '#8bcf7c',
  '#9fdb92',
  '#b7e6ad',
  '#d3f0cc',
];

/** "카테고리별 고민"(354:636) + 도넛차트(355:639, 133×133) + 우측 건수/비율 리스트(349:685 카드, 349×172) */
export function CategoryDonutCard({ slices }: CategoryDonutCardProps) {
  return (
    <div className="flex w-full flex-col gap-4 rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-white p-4 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)]">
      <h2 className="text-[13px] font-semibold text-black">카테고리별 고민</h2>

      {slices.length === 0 ? (
        <p className="text-[13px] font-medium text-[#666]">
          해당 기간에 등록된 고민이 없어요
        </p>
      ) : (
        <div className="flex items-center gap-4">
          <div className="h-33.25 w-33.25 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="count"
                  nameKey="category"
                  innerRadius="60%"
                  outerRadius="100%"
                  stroke="none"
                >
                  {slices.map((slice, index) => (
                    <Cell
                      key={slice.category}
                      fill={DONUT_COLORS[index % DONUT_COLORS.length]}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <ul className="flex min-w-0 flex-1 flex-col gap-2">
            {slices.map((slice, index) => (
              <li
                key={slice.category}
                className="flex items-center gap-2 text-[12px] font-medium text-black"
              >
                <span
                  className="h-2.5 w-2.5 shrink-0 rounded-full"
                  style={{
                    backgroundColor: DONUT_COLORS[index % DONUT_COLORS.length],
                  }}
                />
                <span className="min-w-0 flex-1 truncate">
                  {slice.category}
                </span>
                <span className="shrink-0 text-[#666]">
                  {slice.count}건 ({slice.percent}%)
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
