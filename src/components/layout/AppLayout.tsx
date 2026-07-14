import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileTopBar } from './MobileTopBar';
import { BottomNav } from './BottomNav';

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-white lg:flex-row">
      <Sidebar />
      <MobileTopBar />
      <main className="min-w-0 flex-1 bg-white">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
