import type { LucideIcon } from 'lucide-react';
import { NavLink } from 'react-router-dom';

interface BottomNavItemProps {
  to: string;
  label: string;
  /** lucide-react 아이콘 컴포넌트. active 여부에 따라 라벨과 동일한 팔레트로 색이 바뀐다. */
  icon: LucideIcon;
  /** 홈("/")처럼 하위 경로와 구분해서 정확히 일치할 때만 active로 표시해야 하는 경우 */
  end?: boolean;
}

export function BottomNavItem({ to, label, icon: Icon, end }: BottomNavItemProps) {
  return (
    <NavLink to={to} end={end} className="flex flex-col items-center gap-1">
      {({ isActive }) => (
        <>
          <span className="flex h-7.5 w-7.5 items-center justify-center">
            <Icon
              className={`h-7.5 w-7.5 ${isActive ? 'text-[#729e59]' : 'text-[#666]'}`}
              aria-hidden="true"
            />
          </span>
          <span
            className={`text-[9px] font-semibold ${
              isActive ? 'text-[#729e59]' : 'text-[#666]'
            }`}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  );
}
