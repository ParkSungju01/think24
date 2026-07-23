import type { NotificationItem } from '../../types/notifications';
import { NotificationListItem } from './NotificationListItem';

interface NotificationListProps {
  notifications: NotificationItem[];
  onItemClick: (id: string) => void;
}

export function NotificationList({
  notifications,
  onItemClick,
}: NotificationListProps) {
  return (
    // 확인 완료: 피그마 웹 목업(367×477 흰색 드롭다운 패널) 스타일을 그대로 카드로 재현한다.
    // bg-white + border #e1e1e1 0.5px + shadow + rounded-[20px]. 폭은 부모(NotificationBell의
    // 드롭다운 wrapper)가 w-91.75(367px)로 이미 고정해두므로 여기서는 w-full로 그 폭을 채운다.
    <div className="w-full py-5 rounded-[20px] border-[0.5px] border-[#e1e1e1] bg-white shadow-[0px_2px_4px_rgba(0,0,0,0.08),0px_1px_1px_rgba(0,0,0,0.04)]">
      {/* 확인 완료: 타이틀/뒤로가기 없는 얇은 상단바 + 우측 정렬된 비활성화 더보기(⋮) 버튼만 배치.
          웹은 "모두 읽음으로 표시"/"알림 전체 삭제" 기능이 없어(디자이너 주석) 버튼은 시각적
          일관성 용도로만 두고 클릭은 막는다. */}
      <ul>
        {notifications.map((notification) => (
          <li key={notification.id}>
            <NotificationListItem
              notification={notification}
              onClick={() => onItemClick(notification.id)}
            />
          </li>
        ))}
      </ul>
    </div>
  );
}
