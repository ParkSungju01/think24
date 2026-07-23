interface NotificationOverflowMenuProps {
  onMarkAllAsRead: () => void;
  onRequestDeleteAll: () => void;
}

/**
 * 헤더 케밥(⋮) 버튼을 눌렀을 때 나타나는 오버플로우 메뉴 (이슈 #17, 126:136 실측).
 * bg-[#f5f5f5] rounded-[6px] 154×64px, 구분선 없이 두 항목이 위아래로 쌓인 형태.
 * 바깥 클릭 시 닫는 처리는 부모(NotificationsPage)의 outside-click 컨테이너가 담당한다.
 */
export function NotificationOverflowMenu({
  onMarkAllAsRead,
  onRequestDeleteAll,
}: NotificationOverflowMenuProps) {
  return (
    <div
      className="flex h-16 w-38.5 flex-col justify-center gap-2 rounded-[6px] bg-[#f5f5f5] px-4 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.04),0px_1px_1px_0px_rgba(0,0,0,0.02)]"
      role="menu"
    >
      <button
        type="button"
        role="menuitem"
        onClick={onMarkAllAsRead}
        className="text-left text-[13px] text-black"
      >
        모두 읽음으로 표시
      </button>
      <button
        type="button"
        role="menuitem"
        onClick={onRequestDeleteAll}
        className="text-left text-[13px] text-[#ec2d30]"
      >
        알림 전체 삭제
      </button>
    </div>
  );
}
