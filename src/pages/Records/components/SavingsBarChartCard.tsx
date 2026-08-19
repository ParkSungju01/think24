import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
} from 'recharts';
import { formatWon } from '../../../utils/format';
import type {
  RecordPeriod,
  SavingsBarPoint,
} from '../../../types/spendingRecord';

interface SavingsBarChartCardProps {
  period: RecordPeriod;
  points: SavingsBarPoint[];
}

const TITLE_BY_PERIOD: Partial<Record<RecordPeriod, string>> = {
  last3Months: '최근 3개월 절약 금액',
  lastYear: '월별 절약 금액',
};

/**
 * 기간별 절약 금액 막대차트 — 이번 달(주차별)/최근 3개월(월별 3개)/최근 1년(월별 최대 12개) 3변형.
 * "전체" 선택 시에는 피그마에 변형이 없어 카드 자체를 렌더링하지 않는다(계획 문서 확인 완료).
 */
export function SavingsBarChartCard({
  period,
  points,
}: SavingsBarChartCardProps) {
  if (period === 'all') return null;

  const title = TITLE_BY_PERIOD[period];

  return (
    <div className="flex w-full flex-col gap-4 rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-white p-4 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)]">
      {title && <h2 className="text-[13px] font-semibold text-black">{title}</h2>}

      <div className="h-45.5 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} margin={{ top: 20, left: 0, right: 0 }}>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 10, fill: '#666' }}
            />
            <Bar dataKey="amount" fill="#7ccf8a" radius={[4, 4, 0, 0]}>
              <LabelList
                dataKey="amount"
                position="top"
                formatter={(value: number | string | boolean | null | undefined) =>
                  typeof value === 'number' ? `${formatWon(value)}원` : ''
                }
                style={{ fontSize: 10, fill: '#000', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
