import { NotificationBell } from '../../../components/NotificationBell';

interface HomeHeaderProps {
  userName: string;
}

export function HomeHeader({ userName }: HomeHeaderProps) {
  return (
    <div className="flex items-start justify-between">
      <p className="text-[30px] font-medium leading-snug text-black">
        {userName}님,
        <br />
        오늘도 멈칫하고 계시네요!
      </p>
      <NotificationBell />
    </div>
  );
}
