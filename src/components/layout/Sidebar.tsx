import { useState } from 'react';
import { Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BrandLogo } from './BrandLogo';
import { SideNav } from './SideNav';
import { LogoutConfirmModal } from '../LogoutConfirmModal';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../routes/paths';

export function Sidebar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  const handleLogout = async () => {
    setIsLogoutConfirmOpen(false);
    await signOut();
    navigate(ROUTES.login);
  };

  return (
    <aside className="hidden w-54.5 shrink-0 flex-col bg-[#eefff0] lg:flex">
      {/* 피그마 실측(89:45 햄버거 x=34 → 89:43 로고 x=128 → 89:44 워드마크 x=227): 햄버거가 로고보다 왼쪽 */}
      <div className="flex items-center gap-2.5 px-4.5 pt-5 pb-8.25">
        <Menu className="h-10 w-10 opacity-60" aria-hidden="true" />
        <BrandLogo />
      </div>
      <SideNav />

      {/* docs/plans/mypage.md 확인 완료 5번: 피그마엔 마이페이지(264:1180) 사이드바에만 그려져
          있지만, 사용성을 위해 모든 페이지의 사이드바 하단에 전역으로 노출한다. */}
      <div className="mt-auto px-5.5 pb-6">
        <button
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
          className="w-full rounded-[5px] border-[0.3px] border-[#666] bg-[#f6fef7] px-4 py-2 text-[25px] font-medium text-[#666] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.25)]"
        >
          로그아웃
        </button>
      </div>

      {isLogoutConfirmOpen && (
        <LogoutConfirmModal
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutConfirmOpen(false)}
        />
      )}
    </aside>
  );
}
