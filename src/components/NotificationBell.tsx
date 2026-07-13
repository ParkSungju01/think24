import { Link } from 'react-router-dom';
import alarmIcon from '../assets/alarm.svg';
import { ROUTES } from '../routes/paths';

export function NotificationBell() {
  return (
    // 확인 완료: 읽지 않음 뱃지는 표시하지 않음 (벨 아이콘만)
    <Link
      to={ROUTES.notifications}
      aria-label="알림"
      className="flex h-6.5 w-6.5 items-center justify-center"
    >
      <img src={alarmIcon} alt="" className="h-3.75 w-3.75" />
    </Link>
  );
}
