import { Clock, Clock2 } from "lucide-react";
import type { OngoingWorry } from "../../../types/home";
import { formatRemainingTime, formatWon } from "../../../utils/format";
import { useCountdown } from "../../../hooks/useCountdown";

const TIMER_EXTEND_THRESHOLD_SECONDS = 3600;

interface WorryListItemProps {
  worry: OngoingWorry;
}

export function WorryListItem({ worry }: WorryListItemProps) {
  // 실사용 피드백: 새로고침해야만 타이머가 줄어들던 문제 수정 — useHomeData가 조회 시점에
  // 한 번만 계산해준 worry.remainingSeconds/progressPercent 대신, 이미 로그인/카운트다운
  // 잠금 화면 등에서 검증된 useCountdown(1초 간격 tick, 언마운트 시 clearInterval)으로
  // deadlineAt 기준 잔여 시간을 매초 다시 계산한다. progressPercent는 그 잔여 시간과
  // (deadlineAt - createdAt) 총 구간으로부터 파생한다.
  const remainingSeconds = useCountdown(worry.deadlineAt.getTime());
  const totalMs = worry.deadlineAt.getTime() - worry.createdAt.getTime();
  const elapsedMs = totalMs - remainingSeconds * 1000;
  const progressPercent =
    totalMs > 0 ? Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100)) : 100;

  const canExtendTimer = remainingSeconds <= TIMER_EXTEND_THRESHOLD_SECONDS;

  return (
    // flex-wrap을 둬서 아주 좁은 폭에서 "타이머 늘리기" 버튼이 카드 밖으로 넘치는 대신 다음 줄로
    // 내려가도록 함
    <div className="flex flex-wrap items-center gap-4 rounded-[14px] border border-gray-100 bg-white p-3 shadow-[0px_0px_-4px_-1px_rgba(0,0,0,0.25)]">
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
      {/* 리뷰 재작업(피그마 30:44/31:48/31:56/32:73 재실측): 카드 상단 기준 제목 13px→가격 34px→
          시간 52px→진행바 69px 순으로 "세로로" 쌓여 있고, 버튼은 진행바가 아니라 제목과 같은 높이(11px)에서
          시작한다. 바깥 컬럼에 flex-1이 없어 카드의 남는 폭을 차지하지 못했던 것도 함께 수정 */}
      <div className="flex flex-1 flex-col justify-between">
        {/* 제목/가격/시간을 세로 스택 서브 그룹으로 묶어 왼쪽에 두고, "타이머 늘리기" 버튼은 형제로 분리해
            이 줄에 items-start(제목과 높이를 맞춤) + justify-between(버튼을 오른쪽 끝으로)을 적용.
            flex-wrap은 유지해 좁은 폭에서는 버튼이 다음 줄로 내려가는 기존 동작을 보존 */}
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="flex min-w-20 flex-1 flex-col gap-1.5">
            <p className="truncate text-sm font-medium text-black">
              {worry.name}
            </p>
            <p className="truncate text-[11px] font-medium text-[#666]">
              {formatWon(worry.price)}원
            </p>
            <div className="flex min-w-0 items-center gap-1 text-[10px] text-[#a9d592]">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {formatRemainingTime(remainingSeconds)} 남음
              </span>
            </div>
          </div>
          {canExtendTimer && (
            // 확인 완료: 클릭 시 동작 없음 (no-op)
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 rounded-md bg-[#7ccf8a] px-2 py-1 text-[10px] font-semibold text-white"
            >
              <Clock2 className="h-3 w-3" />
              타이머 늘리기
            </button>
          )}
        </div>
        <div className="mt-1 h-2.5 w-full rounded-[7px] bg-[#f5f5f5]">
          <div
            className="h-2.5 rounded-[7px] bg-[#7ccf8a]"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
