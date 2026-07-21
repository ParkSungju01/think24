import type { NotificationItem } from '../../types/notifications';
import { NotificationEmptyState } from './NotificationEmptyState';
import { NotificationList } from './NotificationList';

interface NotificationsPanelProps {
  notifications: NotificationItem[];
  onItemClick: (id: string) => void;
}

/**
 * 이전 NotificationsPage에 있던 "0건이면 빈 상태, 있으면 목록" 분기 로직을 그대로 재사용하되,
 * 페이지 전체 레이아웃이 아니라 NotificationBell 드롭다운 안에서 렌더링되도록 옮겼다.
 */
export function NotificationsPanel({
  notifications,
  onItemClick,
}: NotificationsPanelProps) {
  if (notifications.length === 0) {
    return (
      // NotificationList와 동일한 카드 스타일(흰 배경/보더/그림자/rounded-20)을 빈 상태에도
      // 적용해 드롭다운이 항상 같은 패널처럼 보이도록 한다.
      <div className="w-full rounded-[20px] border-[0.5px] border-[#e1e1e1] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.08),0px_1px_1px_rgba(0,0,0,0.04)]">
        <NotificationEmptyState />
      </div>
    );
  }

  return (
    <NotificationList notifications={notifications} onItemClick={onItemClick} />
  );
}
