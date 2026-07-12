import type { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  to: string;
  label: string;
  icon: ReactNode;
  /** 홈("/")처럼 하위 경로와 구분해서 정확히 일치할 때만 active로 표시해야 하는 경우 */
  end?: boolean;
}

export function NavItem({ to, label, icon, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors ${
          isActive ? 'bg-[rgba(217,243,207,0.55)]' : ''
        }`
      }
    >
      {({ isActive }) => (
        <>
          <span className="flex h-6 w-6 items-center justify-center opacity-60">
            {icon}
          </span>
          <span
            className={`text-base font-medium ${
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
