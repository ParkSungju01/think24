import { useNavigate } from 'react-router-dom';
import alarmIcon from '../../assets/alarm.svg';
import alarmExistIcon from '../../assets/alarm-exist.svg';
import { useNotifications } from '../../contexts/NotificationsContext';
import { ROUTES } from '../../routes/paths';

/**
 * 이슈 #39: 웹 전용 드롭다운(`variant="dropdown"`)은 데스크톱 분기 제거로 마운트 지점이
 * 사라져 삭제했다(docs/plans/landing-phone-refactor.md 3-6) — 이제 벨을 누르면 항상
 * /notifications 풀스크린 페이지로 이동한다(이슈 #17 확인 완료 사항 그대로).
 */
export function NotificationBell() {
  const navigate = useNavigate();
  const { hasUnread } = useNotifications();

  return (
    <button
      type="button"
      aria-label="알림"
      onClick={() => navigate(ROUTES.notifications)}
      className="flex h-9 w-9 items-center justify-center"
    >
      {/* 확인 완료: 읽지 않음을 별도 뱃지 dot으로 표시하지 않고, 벨 아이콘 자체를 바꾼다.
          안읽은 알림이 하나라도 있으면 alarm-exist.svg, 전부 읽었거나 0건이면 alarm.svg */}
      {/* 피그마 실측(89:58, 67×67px) × 8/15 ≈ 36px → h-9 w-9로 정확히 떨어짐 */}
      <img src={hasUnread ? alarmExistIcon : alarmIcon} alt="" className="h-9 w-9" />
    </button>
  );
}
