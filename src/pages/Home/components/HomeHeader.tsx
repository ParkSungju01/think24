import { NotificationBell } from '../../../components/NotificationBell';

interface HomeHeaderProps {
  userName: string;
}

export function HomeHeader({ userName }: HomeHeaderProps) {
  return (
    <div className="flex items-start justify-between px-4">
      <p className="text-[15px] font-medium text-black lg:text-[16px] xl:text-[30px]">
        ✨ {userName}님,
        <br />
        잠시 멈추면 더 좋은 선택이 보입니다.
      </p>
      {/* 확인 완료: 모바일에서는 MobileTopBar의 벨만 노출(중복 방지) */}
      <div className="hidden lg:flex">
        <NotificationBell />
      </div>
    </div>
  );
}
