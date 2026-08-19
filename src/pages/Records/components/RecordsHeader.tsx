import { PeriodDropdown } from './PeriodDropdown';
import type { RecordPeriod } from '../../../types/spendingRecord';

interface RecordsHeaderProps {
  period: RecordPeriod;
  onPeriodChange: (period: RecordPeriod) => void;
}

/** 제목 "소비 기록"(346:638, 25px semibold) + 기간 드롭다운. docs/plans/spending-record.md 참고 */
export function RecordsHeader({ period, onPeriodChange }: RecordsHeaderProps) {
  return (
    <div className="flex items-center justify-between px-1">
      <h1 className="text-[25px] font-semibold text-black">소비 기록</h1>
      <PeriodDropdown value={period} onChange={onPeriodChange} />
    </div>
  );
}
