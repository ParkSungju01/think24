import { Link } from 'react-router-dom';
import alarmIcon from '../assets/alarm.svg';
import { ROUTES } from '../routes/paths';

export function NotificationBell() {
  return (
    // 확인 완료: 읽지 않음 뱃지는 표시하지 않음 (벨 아이콘만)
    <Link
      to={ROUTES.notifications}
      aria-label="알림"
      className="flex h-9 w-9 items-center justify-center"
    >
      {/* 피그마 실측(89:58, 67×67px) × 8/15 ≈ 36px → h-9 w-9로 정확히 떨어짐 */}
      <img src={alarmIcon} alt="" className="h-9 w-9" />
    </Link>
  );
}
