import type { NotificationItem } from '../../types/notifications';
import { NotificationEmptyState } from './NotificationEmptyState';
import { NotificationList } from './NotificationList';

interface NotificationsPanelProps {
  notifications: NotificationItem[];
  /** 이슈 #31: 실데이터 최초 조회 중이면 true. notifications가 아직 빈 배열이어도
   * "아직 알림이 없어요" 빈 상태를 잠깐 보여주지 않기 위한 구분용 플래그. */
  isLoading: boolean;
  onItemClick: (id: string) => void;
}

/**
 * 이전 NotificationsPage에 있던 "0건이면 빈 상태, 있으면 목록" 분기 로직을 그대로 재사용하되,
 * 페이지 전체 레이아웃이 아니라 NotificationBell 드롭다운 안에서 렌더링되도록 옮겼다.
 */
export function NotificationsPanel({
  notifications,
  isLoading,
  onItemClick,
}: NotificationsPanelProps) {
  if (isLoading) {
    // 피그마에 정의되지 않은 전환 상태(로딩)라 디자인 스펙은 없다. 카드 셸(흰 배경/보더/그림자/
    // rounded-20)은 유지해 빈 상태·목록과 같은 패널로 보이게 하고, 내용만 짧은 안내 문구로 대체한다.
    return (
      <div className="flex h-30 w-full items-center justify-center rounded-[20px] border-[0.5px] border-[#e1e1e1] bg-white text-[13px] text-[#666] shadow-[0px_2px_4px_rgba(0,0,0,0.08),0px_1px_1px_rgba(0,0,0,0.04)]">
        불러오는 중...
      </div>
    );
  }

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
