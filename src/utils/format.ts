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

/**
 * 월별 소비 요약 드롭다운의 기본 선택값으로 쓰는 "현재 월" 라벨.
 * 목데이터 상수가 아니라 실제 호출 시점의 월을 반영해야 해서 컴포넌트 쪽(HomePage)에서 호출한다.
 */
export function getCurrentMonthLabel(date: Date = new Date()): string {
  return `${date.getMonth() + 1}월`;
}
