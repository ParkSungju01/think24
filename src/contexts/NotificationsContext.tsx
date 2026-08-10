import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { NotificationItem } from '../types/notifications';
import {
  fetchNotifications,
  markAsRead as markAsReadRequest,
  markAllAsRead as markAllAsReadRequest,
  deleteNotification as deleteNotificationRequest,
  deleteAll as deleteAllRequest,
} from '../lib/notifications';
import { useAuth } from './AuthContext';

interface NotificationsContextValue {
  notifications: NotificationItem[];
  /** 최초 조회가 아직 끝나지 않은 동안 true. 로그인 직후/페이지 진입 직후 잠깐 존재 —
   * 이 값을 확인하지 않고 notifications.length === 0만으로 빈 상태를 판단하면, 실데이터가
   * 아직 도착하기 전에 "아직 알림이 없어요" 빈 상태가 잠깐 잘못 보일 수 있다. */
  isLoading: boolean;
  /** 안읽은 알림이 하나라도 있는지. NotificationBell 아이콘 자체를 바꾸는 데 사용 */
  hasUnread: boolean;
  /** 알림 클릭 시 호출. 다른 화면으로 이동하지 않고 isRead만 true로 바꾼다 (확인 완료) */
  markAsRead: (id: string) => void;
  /** 모바일 알림 화면(이슈 #17) 오버플로우 메뉴 "모두 읽음으로 표시" 전용. 모든 알림의 isRead를 true로 일괄 변경 */
  markAllAsRead: () => void;
  /** 모바일 알림 화면 개별 삭제 확인 모달 "네" 전용. 배열에서 해당 id만 제거 */
  deleteNotification: (id: string) => void;
  /** 모바일 알림 화면 오버플로우 메뉴 "알림 전체 삭제" → 확인 모달 "네" 전용. 배열을 빈 배열로 교체 */
  deleteAll: () => void;
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
 * 이슈 #31: 더미 데이터 5개(클라이언트 상태만) 대신 Supabase public.notifications 테이블을
 * 실제로 조회/변경한다. 로그인한 유저(user.id)가 바뀔 때마다(로그인/로그아웃) 목록을 다시
 * 조회한다(useHomeData가 session의 user를 구독하는 것과 동일한 패턴). 각 액션은 UI 반응성을
 * 위해 로컬 state를 먼저 낙관적으로 갱신한 뒤 서버에 반영한다 — 실패해도 화면을 롤백하지 않고
 * console.error로만 남긴다(이번 이슈는 CRUD 배선 자체가 목적이라 에러 UI/재시도까지는 범위 밖).
 */
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    // react-hooks/set-state-in-effect: 이펙트 본문에서 setState를 동기적으로 바로 호출하지
    // 않기 위해, "로그아웃 상태" 처리까지 포함해 전부 async IIFE 안에서 수행한다
    // (useHomeData의 try/catch/finally 패턴과 동일).
    (async () => {
      if (!user) {
        if (!cancelled) {
          setNotifications([]);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const data = await fetchNotifications(user.id);
        if (!cancelled) setNotifications(data);
      } catch (err) {
        if (!cancelled) {
          console.error('알림을 불러오지 못했습니다:', err);
          setNotifications([]);
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === id ? { ...item, isRead: true } : item)),
    );
    markAsReadRequest(id).then(({ error }) => {
      if (error) console.error('알림 읽음 처리 실패:', error);
    });
  };

  // 이슈 #17: 오버플로우 메뉴 "모두 읽음으로 표시" — 모든 아이템을 한 번에 읽음 처리
  const markAllAsRead = () => {
    if (!user) return;
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    markAllAsReadRequest(user.id).then(({ error }) => {
      if (error) console.error('알림 전체 읽음 처리 실패:', error);
    });
  };

  // 이슈 #17: 개별 삭제 확인 모달 "네" — 해당 id만 배열에서 제거
  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
    deleteNotificationRequest(id).then(({ error }) => {
      if (error) console.error('알림 삭제 실패:', error);
    });
  };

  // 이슈 #17: 오버플로우 메뉴 "알림 전체 삭제" → 확인 모달 "네" — 전체 비우기
  const deleteAll = () => {
    if (!user) return;
    setNotifications([]);
    deleteAllRequest(user.id).then(({ error }) => {
      if (error) console.error('알림 전체 삭제 실패:', error);
    });
  };

  const hasUnread = useMemo(
    () => notifications.some((item) => !item.isRead),
    [notifications],
  );

  const value: NotificationsContextValue = {
    notifications,
    isLoading,
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
