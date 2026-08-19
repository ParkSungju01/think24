import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { NotificationItem } from '../types/notifications';
import { MOCK_NOTIFICATIONS } from '../lib/notifications';

interface NotificationsContextValue {
  notifications: NotificationItem[];
  /** 이제 항상 즉시 false — 필드는 인터페이스 호환을 위해 유지한다. */
  isLoading: boolean;
  /** 안읽은 알림이 하나라도 있는지. NotificationBell 아이콘 자체를 바꾸는 데 사용 */
  hasUnread: boolean;
  /** 알림 클릭 시 호출. 다른 화면으로 이동하지 않고 isRead만 true로 바꾼다 */
  markAsRead: (id: string) => void;
  /** 오버플로우 메뉴 "모두 읽음으로 표시" 전용. 모든 알림의 isRead를 true로 일괄 변경 */
  markAllAsRead: () => void;
  /** 개별 삭제 확인 모달 "네" 전용. 배열에서 해당 id만 제거 */
  deleteNotification: (id: string) => void;
  /** 오버플로우 메뉴 "알림 전체 삭제" → 확인 모달 "네" 전용. 배열을 빈 배열로 교체 */
  deleteAll: () => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined,
);

/**
 * docs/plans/local-only-migration.md "3. 알림 mock 전환": Supabase CRUD 대신 mount 시
 * MOCK_NOTIFICATIONS를 초기 상태로 얹는 컴포넌트 상태 기반 Provider로 재작성했다. 읽음/삭제는
 * 전부 로컬 state로만 처리하고 어디에도 영속화하지 않는다(ADR-0004와 동일한 톤) — 새로고침하면
 * MOCK_NOTIFICATIONS 원본으로 되돌아간다.
 *
 * 알림 벨(NotificationBell)이 여러 화면에 마운트될 수 있어, AuthContext/NicknameContext와
 * 동일한 패턴으로 상태를 앱 전역에서 하나만 공유한다.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  const deleteAll = () => {
    setNotifications([]);
  };

  const hasUnread = useMemo(
    () => notifications.some((item) => !item.isRead),
    [notifications],
  );

  const value: NotificationsContextValue = {
    notifications,
    isLoading: false,
    hasUnread,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  };

  return (
    <NotificationsContext.Provider value={value}>
      {children}
    </NotificationsContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- Provider와 함께 두는 것이 계획서 컨벤션(AuthContext.tsx 단일 파일)에 맞음
export function useNotifications(): NotificationsContextValue {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}
