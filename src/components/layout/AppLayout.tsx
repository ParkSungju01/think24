import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileTopBar } from './MobileTopBar';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    // 확인 완료: 모바일(425px 미만) 프레임 배경은 피그마 실측 #eefff0(사이드바와 동일 톤),
    // 425px 이상(사이드바 레이아웃)은 기존에 이미 검증된 흰색 콘텐츠 영역을 그대로 유지
    <div className="flex min-h-screen flex-col bg-[#eefff0] lg:flex-row lg:bg-white">
      <Sidebar />
      <MobileTopBar />
      <main className="min-w-0 flex-1 bg-[#eefff0] lg:bg-white">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
