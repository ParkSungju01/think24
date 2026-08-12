import { Outlet } from 'react-router-dom';
import { MobileTopBar } from './MobileTopBar';
import { BottomNav } from './BottomNav';

// 이슈 #39: 데스크톱 사이드바(Sidebar)는 폰 프레임 안에 마운트 지점이 없어져 제거했다
// (docs/plans/landing-phone-refactor.md 3-6, 파일 자체 삭제는 부수 정리 커밋에서 처리).
// min-h-screen(브라우저 뷰포트 기준) → h-full(PhoneFrame 스크린 영역 기준)로 전환.
export function AppLayout() {
  return (
    <div className="flex h-full flex-col bg-[#eefff0]">
      <MobileTopBar />
      <main className="min-w-0 flex-1 bg-[#eefff0]">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
