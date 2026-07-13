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
    <div className="flex items-center gap-4">
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
        <p className="truncate text-base font-medium text-black">
          {worry.name}
        </p>
        <p className="text-[15px] font-medium text-black">
          {formatWon(worry.price)}원
        </p>
        <div className="h-1.75 w-full rounded-[7px] bg-[#f5f5f5]">
          <div
            className="h-1.75 rounded-[7px] bg-[#7ccf8a]"
            style={{ width: `${worry.progressPercent}%` }}
          />
        </div>
        <div className="flex items-center gap-1 text-[13px] text-[#a9d592]">
          <Clock className="h-3.5 w-3.5" />
          <span>{formatRemainingTime(worry.remainingSeconds)} 남음</span>
        </div>
      </div>

      {canExtendTimer && (
        // 확인 완료: 클릭 시 동작 없음 (no-op)
        <button
          type="button"
          className="flex shrink-0 items-center gap-1 rounded-md bg-[#7ccf8a] px-3 py-2 text-[13px] font-medium text-white"
        >
          <Plus className="h-3.5 w-3.5" />
          타이머 늘리기
        </button>
      )}
    </div>
  );
}
