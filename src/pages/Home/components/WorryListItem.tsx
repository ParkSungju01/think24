import { Clock, Clock2 } from "lucide-react";
import type { OngoingWorry } from "../../../types/home";
import { formatRemainingTime, formatWon } from "../../../utils/format";

const TIMER_EXTEND_THRESHOLD_SECONDS = 3600;

interface WorryListItemProps {
  worry: OngoingWorry;
}

export function WorryListItem({ worry }: WorryListItemProps) {
  const canExtendTimer =
    worry.remainingSeconds <= TIMER_EXTEND_THRESHOLD_SECONDS;

  return (
    // 확인 완료: "카드 안 카드" 스타일(흰 배경+둥근 모서리+그림자)은 xl(1024px)부터 제거, 데스크톱은 기존 단순 행 구조 유지
    // 리뷰 재작업: 425~1023px(lg) 구간은 사이드바(218px 고정 폭)까지 감안하면 카드 폭이 여전히 좁아,
    // 이전 라운드에서 lg=데스크톱 확정값으로 곧바로 전환하던 걸(카드 스타일 제거 포함) 전부 xl로 미루고,
    // lg 구간 전용의 더 작은 중간 크기(썸네일/버튼/간격)를 근사치로 추가했다(피그마에 없는 구간, 스크린샷으로 조정).
    // flex-wrap도 함께 둬서 아주 좁은 폭에서 "타이머 늘리기" 버튼이 카드 밖으로 넘치는 대신 다음 줄로 내려가도록 함
    <div className="flex flex-wrap items-center gap-4 rounded-[14px] border border-gray-100 bg-white p-3 shadow-[0px_0px_-4px_-1px_rgba(0,0,0,0.25)] lg:gap-2 lg:p-2 xl:flex-nowrap xl:gap-4 xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none">
      {/* 확인 완료: 상품 등록 기능이 아직 없어 실사 이미지 대신 임시 플레이스홀더 사용 */}
      {worry.thumbnailUrl ? (
        <img
          src={worry.thumbnailUrl}
          alt={worry.name}
          className="h-16 w-16 shrink-0 rounded-[10px] object-cover lg:h-11 lg:w-11 xl:h-16 xl:w-16"
        />
      ) : (
        <div
          className="h-16 w-16 shrink-0 rounded-[10px] bg-[#f5f5f5] lg:h-11 lg:w-11 xl:h-16 xl:w-16"
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
            <p className="truncate text-sm font-medium text-black xl:text-base">
              {worry.name}
            </p>
            <p className="truncate text-[11px] font-medium text-[#666] xl:text-[15px] xl:text-black">
              {formatWon(worry.price)}원
            </p>
            <div className="flex min-w-0 items-center gap-1 text-[10px] text-[#a9d592] xl:text-[13px]">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">
                {formatRemainingTime(worry.remainingSeconds)} 남음
              </span>
            </div>
          </div>
          {canExtendTimer && (
            // 확인 완료: 클릭 시 동작 없음 (no-op)
            <button
              type="button"
              className="flex shrink-0 items-center gap-1 rounded-md bg-[#7ccf8a] px-2 py-1 text-[10px] font-semibold text-white lg:px-1.5 lg:py-1 lg:text-[9px] xl:px-3 xl:py-2 xl:text-[13px] xl:font-medium"
            >
              <Clock2 className="h-3 w-3 lg:h-2.5 lg:w-2.5 xl:h-3.5 xl:w-3.5" />
              타이머 늘리기
            </button>
          )}
        </div>
        <div className="h-2.5 w-full rounded-[7px] mt-1 bg-[#f5f5f5] xl:h-1.75">
          <div
            className="h-2.5 rounded-[7px] bg-[#7ccf8a] xl:h-1.75"
            style={{ width: `${worry.progressPercent}%` }}
          />
        </div>
      </div>
    </div>
  );
}
