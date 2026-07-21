import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../../components/ConfirmModal';
import { NotificationEmptyState } from '../../components/NotificationBell/NotificationEmptyState';
import { useNotifications } from '../../contexts/NotificationsContext';
import { ROUTES } from '../../routes/paths';
import { NotificationOverflowMenu } from './components/NotificationOverflowMenu';
import { NotificationSwipeableListItem } from './components/NotificationSwipeableListItem';
import { NotificationsHeader } from './components/NotificationsHeader';

type ModalState = { type: 'deleteAll' } | { type: 'deleteOne'; id: string } | null;

/**
 * 이슈 #17: 모바일 전용 알림 화면. 확인 완료 사항대로 AppLayout 밖의 독립 풀스크린
 * 라우트로 구현하고(로그인/회원가입 페이지와 동일한 패턴), lg(426px) 이상 폭에서
 * 접근하면 홈으로 리다이렉트한다. 피그마 목업 자체가 모바일 전용 디자인이라
 * 데스크톱 대응 레이아웃은 존재하지 않는다(확인 완료).
 */
export function NotificationsPage() {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, deleteNotification, deleteAll } =
    useNotifications();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  // 확인 완료: lg(426px) 이상 폭에서 이 라우트에 접근하면 홈으로 리다이렉트한다.
  // 피그마에 데스크톱 버전 목업이 없고, 웹은 이미 별도의 드롭다운 UI(NotificationBell)를 쓴다.
  // (CSS --breakpoint-lg와 동일하게 426px로 맞춤: Tailwind lg:는 min-width라 425px 자체를
  // 모바일로 두려면 매치 기준이 426px이어야 CSS/JS 판단이 정확히 일치한다.)
  useEffect(() => {
    const query = window.matchMedia('(min-width: 426px)');
    if (query.matches) {
      navigate(ROUTES.home, { replace: true });
      return;
    }
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) {
        navigate(ROUTES.home, { replace: true });
      }
    };
    query.addEventListener('change', handleChange);
    return () => query.removeEventListener('change', handleChange);
  }, [navigate]);

  // 오버플로우 메뉴 바깥 클릭 시 닫힘 (NotificationBell의 outside-click 패턴 재사용)
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuContainerRef.current &&
        !menuContainerRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleBack = () => {
    // 확인 완료: navigate(-1) 또는 홈 고정 중 자연스러운 쪽 — 벨을 통해서만 들어오는
    // 페이지라 히스토리가 항상 있으므로 navigate(-1)이 자연스럽다.
    navigate(-1);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead();
    setIsMenuOpen(false);
  };

  const handleRequestDeleteAll = () => {
    setIsMenuOpen(false);
    setModal({ type: 'deleteAll' });
  };

  const handleConfirmModal = () => {
    if (modal?.type === 'deleteAll') {
      deleteAll();
    } else if (modal?.type === 'deleteOne') {
      deleteNotification(modal.id);
      setOpenItemId(null);
    }
    setModal(null);
  };

  const handleCancelModal = () => {
    // 확인 완료: 개별삭제 "아니요"는 스와이프 상태도 닫힌 상태로 복구
    if (modal?.type === 'deleteOne') {
      setOpenItemId(null);
    }
    setModal(null);
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <NotificationsHeader
        ref={menuContainerRef}
        isMenuDisabled={notifications.length === 0}
        onBack={handleBack}
        onToggleMenu={() => setIsMenuOpen((prev) => !prev)}
      >
        {isMenuOpen && (
          <div className="absolute right-0 top-full z-50 mt-1">
            <NotificationOverflowMenu
              onMarkAllAsRead={handleMarkAllAsRead}
              onRequestDeleteAll={handleRequestDeleteAll}
            />
          </div>
        )}
      </NotificationsHeader>

      {notifications.length === 0 ? (
        <NotificationEmptyState />
      ) : (
        <ul>
          {notifications.map((notification) => (
            <li key={notification.id}>
              <NotificationSwipeableListItem
                notification={notification}
                isOpen={openItemId === notification.id}
                onOpen={() => setOpenItemId(notification.id)}
                onClose={() =>
                  setOpenItemId((prev) => (prev === notification.id ? null : prev))
                }
                onItemClick={() => markAsRead(notification.id)}
                onRequestDelete={() =>
                  setModal({ type: 'deleteOne', id: notification.id })
                }
              />
            </li>
          ))}
        </ul>
      )}

      {modal && (
        <ConfirmModal
          message={
            modal.type === 'deleteAll'
              ? '알림을 모두 삭제하시겠습니까?'
              : '해당 알림을 삭제하시겠습니까?'
          }
          onConfirm={handleConfirmModal}
          onCancel={handleCancelModal}
        />
      )}
    </div>
  );
}

export default NotificationsPage;
