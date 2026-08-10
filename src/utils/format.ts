export function formatWon(amount: number): string {
  return amount.toLocaleString('ko-KR');
}

/** 초 단위 잔여 시간을 HH:MM:SS 형태로 표시 */
export function formatRemainingTime(totalSeconds: number): string {
  const clamped = Math.max(0, totalSeconds);
  const hours = Math.floor(clamped / 3600);
  const minutes = Math.floor((clamped % 3600) / 60);
  const seconds = Math.floor(clamped % 60);
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
}

/** 천 단위 콤마가 포함된 숫자 문자열(예: "100,000")을 숫자로 되돌린다 */
export function parseWon(formatted: string): number {
  const digitsOnly = formatted.replace(/[^0-9]/g, '');
  return digitsOnly ? Number(digitsOnly) : 0;
}

/**
 * 월별 소비 요약 드롭다운의 기본 선택값으로 쓰는 "현재 월" 라벨.
 * 목데이터 상수가 아니라 실제 호출 시점의 월을 반영해야 해서 컴포넌트 쪽(HomePage)에서 호출한다.
 */
export function getCurrentMonthLabel(date: Date = new Date()): string {
  return `${date.getMonth() + 1}월`;
}

/**
 * 이슈 #31: 알림 목록의 createdAt(Date, DB timestamptz)을 "13시간 전" 같은 상대 시간
 * 문자열로 변환한다. 기존 더미 데이터는 이 문자열을 직접 저장했지만, 실데이터 전환
 * 이후에는 Date를 저장해두고 렌더링 시점마다 이 함수로 계산한다.
 */
export function formatRelativeTime(date: Date, now: Date = new Date()): string {
  const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffSeconds < 60) return '방금 전';

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}분 전`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}일 전`;
}
