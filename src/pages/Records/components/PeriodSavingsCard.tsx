import { Triangle } from 'lucide-react';
import pigIllustration from '../../../assets/pig.svg';
import { formatWon } from '../../../utils/format';
import {
  RECORD_PERIOD_OPTIONS,
  type RecordPeriod,
} from '../../../types/spendingRecord';

// 사용자 확인: 배지 라벨은 제목의 periodLabel과 다르게 "직전 대비 증감"의 기준 구간을
// 가리켜야 한다(예: "이번 달 절약한 금액" 카드의 배지는 "이번 달 +N원"이 아니라
// "저번달 +N원"). all(전체)은 비교 기준 구간이 없어 배지 자체를 표시하지 않는다.
const DIFF_BADGE_LABEL: Partial<Record<RecordPeriod, string>> = {
  thisMonth: '저번달',
  last3Months: '저번 3개월',
  lastYear: '저번 1년',
};

interface PeriodSavingsCardProps {
  period: RecordPeriod;
  savingsAmount: number;
  savingsAmountDiff: number;
  abandonedCount: number;
  purchasedCount: number;
}

/**
 * "이번 달 절약한 금액"(337:1126~1133). 기존 `SavedAmountCard`와 시각 스타일이 100% 동일하되,
 * 자기 자신(/records)으로 이동하는 Link가 불필요해 정적 카드로 구현한다(계획 문서 확인 완료 사항).
 * 타이틀/배지 라벨은 선택된 기간에 따라 동적으로 바뀐다.
 */
export function PeriodSavingsCard({
  period,
  savingsAmount,
  savingsAmountDiff,
  abandonedCount,
  purchasedCount,
}: PeriodSavingsCardProps) {
  const periodLabel =
    RECORD_PERIOD_OPTIONS.find((option) => option.value === period)?.label ??
    '';
  // 전체(all)는 비교 기준 구간이 없어 배지를 아예 렌더링하지 않는다.
  const diffLabel = period === 'all' ? null : (DIFF_BADGE_LABEL[period] ?? periodLabel);

  return (
    <div className="flex items-center justify-between rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-white p-4 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)]">
      <div className="flex flex-col gap-4">
        <h2 className="text-[17px] font-semibold text-black">
          {periodLabel} 절약한 금액
        </h2>
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-black">
            <span className="text-[28px] font-medium">
              {formatWon(savingsAmount)}
            </span>
            <span className="text-[15px] font-medium">원</span>
          </p>
          {diffLabel && (
            <span className="flex w-fit items-center gap-1 rounded-md bg-[#eefff0] px-3 py-1.5 text-[10px] font-medium whitespace-nowrap text-[#629f41]">
              <Triangle className="h-3.25 w-3.25" fill="#7ccf8a" strokeWidth={0} />
              {diffLabel} + {formatWon(savingsAmountDiff)}원
            </span>
          )}
        </div>
        <p className="text-[10px] font-medium text-black">
          포기한 상품 {abandonedCount}개 | 구매한 상품 {purchasedCount}개
        </p>
      </div>
      <img src={pigIllustration} alt="" className="h-25 w-27 shrink-0" />
    </div>
  );
}
