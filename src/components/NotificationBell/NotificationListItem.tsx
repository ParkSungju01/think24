import type { NotificationItem } from '../../types/notifications';

interface NotificationListItemProps {
  notification: NotificationItem;
  onClick: () => void;
}

export function NotificationListItem({
  notification,
  onClick,
}: NotificationListItemProps) {
  const { worryName, message, createdAt, isRead, thumbnailUrl } = notification;

  return (
    // 확인 완료: 클릭 시 다른 화면/타이머로 이동하지 않는다. isRead만 true로 바꿔 안읽음 dot을 지운다
    // (클라이언트 상태만 변경, 영속화 불필요).
    // 요청된 가로 배치 순서: 안읽음 dot → 썸네일 → 텍스트(제목/설명/시간).
    // alarm-exist.svg는 그대로 제거 상태 유지 — 이제 그 아이콘은 NotificationBell 버튼 자체의
    // 안읽음 상태 표시로만 쓰인다.
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-2 border-b border-[#f0f0f0] px-3 py-3 text-left last:border-b-0"
    >
      {/* 안읽음 표시: bg-[#a9d592] 8×8(h-2 w-2) dot. dot 자리 자체는 항상 확보해두고 읽음 상태일
          때만 invisible 처리해서, 안읽음/읽음 아이템이 섞여 있어도 썸네일·텍스트 위치가 흔들리지
          않게 한다(같은 자리에 폭만 남기고 안 보이게 함). self-center로 옆 썸네일의 세로 중앙에 맞춘다. */}
      <span
        className={`h-2 w-2 shrink-0 self-center rounded-full bg-[#a9d592] ${
          isRead ? 'invisible' : ''
        }`}
        aria-hidden="true"
      />
      {/* WorryListItem과 동일한 패턴: thumbnailUrl이 있으면 이미지를, 없으면 회색 placeholder
          박스를 표시한다. 11px/9px의 작은 타이포에 맞춰 WorryListItem(64px)보다 작은 40px로 사용 */}
      {thumbnailUrl ? (
        <img
          src={thumbnailUrl}
          alt=""
          className="h-10 w-10 shrink-0 rounded-[10px] object-cover"
        />
      ) : (
        <div
          className="h-10 w-10 shrink-0 rounded-[10px] bg-[#f5f5f5]"
          aria-hidden="true"
        />
      )}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        {/* 요청: 제목과 시간을 같은 줄에 justify-between으로 배치(제목 왼쪽, 시간 오른쪽 끝).
            제목은 min-w-0 + truncate로 시간 자리를 침범하지 않게 하고, 시간은 shrink-0 +
            whitespace-nowrap으로 줄바꿈 없이 항상 같은 줄 끝에 고정한다. */}
        <div className="flex items-center justify-between gap-2">
          <p className="min-w-0 truncate text-[11px] font-semibold text-black">
            '{worryName}'
          </p>
          <span className="shrink-0 whitespace-nowrap text-[9px] font-medium text-[#666]">
            {createdAt}
          </span>
        </div>
        <p className="text-[9px] font-medium text-[#666]">{message}</p>
      </div>
    </button>
  );
}
