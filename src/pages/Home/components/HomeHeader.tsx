import { useNavigate } from 'react-router-dom';
import { NotificationBell } from '../../../components/NotificationBell';
import { useAuth } from '../../../contexts/AuthContext';
import { ROUTES } from '../../../routes/paths';

interface HomeHeaderProps {
  userName: string;
}

export function HomeHeader({ userName }: HomeHeaderProps) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate(ROUTES.login);
  };

  return (
    <div className="flex items-start justify-between px-4">
      <p className="text-[15px] font-medium text-black lg:text-[16px] xl:text-[30px]">
        ✨ {userName}님,
        <br />
        잠시 멈추면 더 좋은 선택이 보입니다.
      </p>
      <div className="flex items-center gap-3">
        {/* TODO(임시): 로그인/로그아웃 플로우 테스트 편의용 임시 버튼. 정식 디자인 반영 시 제거/이동 */}
        <button
          type="button"
          onClick={handleLogout}
          className="rounded-md border border-[#ccc] px-2 py-1 text-[13px] font-medium text-[#666]"
        >
          로그아웃
        </button>
        {/* 확인 완료: 모바일에서는 MobileTopBar의 벨만 노출(중복 방지) */}
        <div className="hidden lg:flex">
          <NotificationBell />
        </div>
      </div>
    </div>
  );
}
