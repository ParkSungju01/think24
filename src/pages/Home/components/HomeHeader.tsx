import { NotificationBell } from '../../../components/NotificationBell';

interface HomeHeaderProps {
  userName: string;
}

export function HomeHeader({ userName }: HomeHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <p className="text-[30px] font-medium text-black">
        ✨ {userName}님,
        <br />
        잠시 멈추면 더 좋은 선택이 보입니다.
      </p>
      <NotificationBell />
    </div>
  );
}
