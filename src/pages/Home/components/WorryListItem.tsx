import { Clock, Plus } from 'lucide-react';
import type { OngoingWorry } from '../../../types/home';
import { formatRemainingTime, formatWon } from '../../../utils/format';

const TIMER_EXTEND_THRESHOLD_SECONDS = 3600;

interface WorryListItemProps {
  worry: OngoingWorry;
}

export function WorryListItem({ worry }: WorryListItemProps) {
  const canExtendTimer = worry.remainingSeconds <= TIMER_EXTEND_THRESHOLD_SECONDS;

  return (
    // 확인 완료: 모바일에서만 "카드 안 카드" 스타일(흰 배경+둥근 모서리+그림자) 적용, 데스크톱은 기존 단순 행 구조 유지
    <div className="flex items-center gap-4 rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-white p-3 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)] lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0 lg:shadow-none">
      {/* 확인 완료: 상품 등록 기능이 아직 없어 실사 이미지 대신 임시 플레이스홀더 사용 */}
      {worry.thumbnailUrl ? (
        <img
          src={worry.thumbnailUrl}
          alt={worry.name}
          className="h-16 w-16 shrink-0 rounded-[10px] object-cover"
        />
      ) : (
        <div
          className="h-16 w-16 shrink-0 rounded-[10px] bg-[#f5f5f5]"
          aria-hidden="true"
        />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <p className="truncate text-sm font-medium text-black lg:text-base">
          {worry.name}
        </p>
        <p className="text-[11px] font-medium text-[#666] lg:text-[15px] lg:text-black">
          {formatWon(worry.price)}원
        </p>
        <div className="h-2.5 w-full rounded-[7px] bg-[#f5f5f5] lg:h-1.75">
          <div
            className="h-2.5 rounded-[7px] bg-[#7ccf8a] lg:h-1.75"
            style={{ width: `${worry.progressPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-1 text-[10px] text-[#a9d592] lg:text-[13px]">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatRemainingTime(worry.remainingSeconds)} 남음</span>
        </div>
      </div>

      {canExtendTimer && (
        // 확인 완료: 클릭 시 동작 없음 (no-op)
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 rounded-md bg-[#7ccf8a] px-2 py-1 text-[10px] font-semibold text-white lg:px-3 lg:py-2 lg:text-[13px] lg:font-medium"
        >
          <Plus className="h-3 w-3 lg:h-3.5 lg:w-3.5" />
          타이머 늘리기
        </button>
      )}
    </div>
  );
}
