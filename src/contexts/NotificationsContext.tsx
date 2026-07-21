import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { NotificationItem } from '../types/notifications';
import { dummyNotifications } from '../lib/notifications';

interface NotificationsContextValue {
  notifications: NotificationItem[];
  /** 안읽은 알림이 하나라도 있는지. NotificationBell 아이콘 자체를 바꾸는 데 사용 */
  hasUnread: boolean;
  /** 알림 클릭 시 호출. 다른 화면으로 이동하지 않고 isRead만 true로 바꾼다 (확인 완료) */
  markAsRead: (id: string) => void;
}

const NotificationsContext = createContext<NotificationsContextValue | undefined>(
  undefined,
);

/**
 * 알림 벨(`NotificationBell`)이 모바일 상단바/데스크톱 홈 헤더 두 곳에 동시에 마운트돼 있어(반응형
 * CSS로 하나만 보이게 처리) 각자 별도의 로컬 state를 두면 한쪽에서 읽음 처리해도 다른 쪽 아이콘이
 * 갱신되지 않는 문제가 생긴다. 이를 피하려고 AuthContext와 동일한 패턴으로 상태를 앱 전역에서
 * 하나만 공유한다.
 *
 * 이번 이슈는 더미 데이터 5개를 클라이언트 상태로만 다루는 범위(확인 완료). 실제 Supabase
 * notifications 테이블 연동(조회/무한 스크롤/읽음 영속화)은 별도 이슈로 미룬다. 새로고침 시
 * 읽음 상태가 초기화돼도 무방하다는 점도 이미 확인됐다.
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] =
    useState<NotificationItem[]>(dummyNotifications);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
  };

  const hasUnread = useMemo(
    () => notifications.some((item) => !item.isRead),
    [notifications],
  );

  const value: NotificationsContextValue = {
    notifications,
    hasUnread,
    markAsRead,
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
