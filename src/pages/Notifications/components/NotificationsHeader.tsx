import { ChevronLeft, MoreVertical } from 'lucide-react';
import { forwardRef, type ReactNode } from 'react';

interface NotificationsHeaderProps {
  /** 알림 0건일 때는 "모두 읽음"/"전체 삭제"가 의미 없으므로 케밥 버튼을 비활성화 상태로 둔다 (확인 완료) */
  isMenuDisabled: boolean;
  onBack: () => void;
  onToggleMenu: () => void;
  /** 오버플로우 메뉴(NotificationOverflowMenu). 케밥 버튼과 같은 relative 컨테이너 안에 렌더링해 위치/outside-click 기준점을 공유한다 */
  children?: ReactNode;
}

/**
 * 이슈 #17 확인 완료: 피그마 목업엔 케밥(⋮) 버튼만 있지만, 페이지를 벗어날 수단이 없어
 * 사용성을 위해 케밥 버튼 옆에 뒤로가기 아이콘을 추가한다. 두 아이콘 모두 헤더 우측에
 * 나란히 배치한다(케밥 버튼 "옆에" 추가한다는 확인 완료 문구를 그대로 따름).
 * ref는 오버플로우 메뉴 outside-click 감지를 위해 부모(NotificationsPage)가 컨테이너로 사용한다.
 */
export const NotificationsHeader = forwardRef<HTMLDivElement, NotificationsHeaderProps>(
  function NotificationsHeader({ isMenuDisabled, onBack, onToggleMenu, children }, ref) {
    return (
      <header className="flex items-center justify-between bg-white px-3 py-3">
        <button
          type="button"
          aria-label="뒤로가기"
          onClick={onBack}
          className="flex h-8 w-8 items-center justify-center text-black"
        >
          {/* 케밥(29px)과 시각적 크기감을 맞추기 위해 동일하게 size-7.25(29px) 적용 */}
          <ChevronLeft className="size-7.25" />
        </button>
        <div ref={ref} className="relative">
          <button
            type="button"
            aria-label="더보기"
            disabled={isMenuDisabled}
            onClick={onToggleMenu}
            className="flex h-8 w-8 items-center justify-center text-black disabled:cursor-not-allowed disabled:opacity-40"
          >
            {/* 피그마 실측: 케밥 아이콘 29×29px → size-7.25(7.25×4=29px), 검정 */}
            <MoreVertical className="size-7.25 text-black" />
          </button>
          {children}
        </div>
      </header>
    );
  },
);
