import { useEffect, useRef, useState } from 'react';
import alarmIcon from '../../assets/alarm.svg';
import alarmExistIcon from '../../assets/alarm-exist.svg';
import { useNotifications } from '../../contexts/NotificationsContext';
import { NotificationsPanel } from './NotificationsPanel';

export function NotificationBell() {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { notifications, hasUnread, markAsRead } = useNotifications();

  // 확인 완료: 별도 페이지(/notifications)로 이동하는 대신, 벨을 클릭하면 바로 아래에
  // 드롭다운 패널이 펼쳐진다(피그마 웹 목업 원본 형태). 바깥 영역을 클릭하면 닫힌다.
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      {/* 확인 완료: 읽지 않음을 별도 뱃지 dot으로 표시하지 않고, 벨 아이콘 자체를 바꾼다.
          안읽은 알림이 하나라도 있으면 alarm-exist.svg, 전부 읽었거나 0건이면 alarm.svg */}
      <button
        type="button"
        aria-label="알림"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex h-9 w-9 items-center justify-center"
      >
        {/* 피그마 실측(89:58, 67×67px) × 8/15 ≈ 36px → h-9 w-9로 정확히 떨어짐 */}
        <img
          src={hasUnread ? alarmExistIcon : alarmIcon}
          alt=""
          className="h-9 w-9"
        />
      </button>
      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-91.75 max-w-[calc(100vw-1.5rem)]">
          <NotificationsPanel
            notifications={notifications}
            onItemClick={markAsRead}
          />
        </div>
      )}
    </div>
  );
}
