import {
  Bar,
  BarChart,
  LabelList,
  ResponsiveContainer,
  XAxis,
} from 'recharts';
import { formatWon, formatWonCompact } from '../../../utils/format';
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
  // 버그 수정(이슈 #44): "최근 1년"은 막대 12개라 간격이 좁아 formatWon 풀포맷 라벨끼리
  // 겹친다. 막대 수가 적은 이번 달(4개)/최근 3개월(3개)은 공간 여유가 있고 피그마 실측
  // 문구와도 일치해야 하니 풀포맷을 그대로 유지, lastYear만 압축 포맷+작은 폰트로 전환한다.
  const isDense = period === 'lastYear';
  const labelFormatter = isDense ? formatWonCompact : formatWon;
  const labelFontSize = isDense ? 9 : 10;

  return (
    <div className="flex w-full flex-col gap-4 rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-white p-4 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)]">
      {title && <h2 className="text-[13px] font-semibold text-black">{title}</h2>}

      <div className="h-45.5 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} margin={{ top: 20, left: 0, right: 10 }}>
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
                  typeof value === 'number'
                    ? isDense
                      ? labelFormatter(value)
                      : `${labelFormatter(value)}원`
                    : ''
                }
                style={{ fontSize: labelFontSize, fill: '#000', fontWeight: 600 }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
