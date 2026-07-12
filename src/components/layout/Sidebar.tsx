import { Menu } from 'lucide-react';
import { BrandLogo } from './BrandLogo';
import { SideNav } from './SideNav';

export function Sidebar() {
  return (
    <aside className="flex w-[409px] shrink-0 flex-col bg-[#eefff0]">
      <div className="flex items-center justify-between px-6 pt-10 pb-8">
        <BrandLogo />
        <Menu className="h-7 w-7 opacity-60" aria-hidden="true" />
      </div>
      <SideNav />
    </aside>
  );
}
