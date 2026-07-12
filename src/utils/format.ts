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
