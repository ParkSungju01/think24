import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ConfirmModal } from '../../components/ConfirmModal';
import { NotificationEmptyState } from '../../components/NotificationBell/NotificationEmptyState';
import { useNotifications } from '../../contexts/NotificationsContext';
import { NotificationOverflowMenu } from './components/NotificationOverflowMenu';
import { NotificationSwipeableListItem } from './components/NotificationSwipeableListItem';
import { NotificationsHeader } from './components/NotificationsHeader';

type ModalState = { type: 'deleteAll' } | { type: 'deleteOne'; id: string } | null;

/**
 * 이슈 #17: 모바일 전용 알림 화면. AppLayout 밖의 독립 풀스크린 라우트로 구현했다(로그인/
 * 회원가입 페이지와 동일한 패턴). 피그마 목업 자체가 모바일 전용 디자인이라 데스크톱 대응
 * 레이아웃은 존재하지 않는다(확인 완료).
 *
 * 이슈 #39: 이전에는 426px 이상 폭에서 이 라우트에 접근하면 홈으로 리다이렉트하는
 * matchMedia useEffect가 있었다("웹은 드롭다운을 쓴다"는 옛 구조 전제). 이제 모든 라우트가
 * 항상 PhoneFrame(고정된 좁은 폭) 안에서 렌더링되고 NotificationBell의 dropdown variant도
 * 삭제돼 그 전제가 사라졌으므로, 리다이렉트 로직 자체를 통째로 제거했다
 * (docs/plans/landing-phone-refactor.md 2-4 — CSS 클래스가 아니라 로직 삭제 대상).
 */
export function NotificationsPage() {
  const navigate = useNavigate();
  const {
    notifications,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    deleteAll,
  } = useNotifications();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openItemId, setOpenItemId] = useState<string | null>(null);
  const [modal, setModal] = useState<ModalState>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);

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
    <div className="flex h-full flex-col bg-white">
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

      {isLoading ? (
        // 이슈 #31: 실데이터 최초 조회 중에는 "아직 알림이 없어요" 빈 상태를 잠깐 보여주지
        // 않는다. 피그마에 정의되지 않은 전환 상태라 별도 스펙 없이 간단한 안내 문구만 표시.
        <div className="flex flex-1 items-center justify-center text-[13px] text-[#666]">
          불러오는 중...
        </div>
      ) : notifications.length === 0 ? (
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
