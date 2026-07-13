import { Menu } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { SideNav } from './SideNav';

export function Sidebar() {
  return (
    <aside className="flex w-54.5 shrink-0 flex-col bg-[#eefff0]">
      {/* 피그마 실측(89:45 햄버거 x=34 → 89:43 로고 x=128 → 89:44 워드마크 x=227): 햄버거가 로고보다 왼쪽 */}
      <div className="flex items-center gap-2.5 px-4.5 pt-5 pb-8.25">
        <Menu className="h-10 w-10 opacity-60" aria-hidden="true" />
        <BrandLogo />
      </div>
      <SideNav />
    </aside>
  );
}
