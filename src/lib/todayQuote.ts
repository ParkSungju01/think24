// "오늘의 소비 한 줄" 문구 소스 (사용자 확인 완료: DB 테이블 없이 프론트 고정 배열에서 매일 랜덤 선택)
const QUOTES: readonly string[] = [
  '오늘 참은 소비가 내일의 여유가 됩니다.',
  '갖고 싶은 마음보다 필요한 마음을 먼저 물어보세요.',
  '장바구니에 하루만 더 담아두면, 후회는 줄어듭니다.',
  '지금의 참을성이 다음 달의 통장 잔고를 지킵니다.',
  '충동은 24시간이면 대부분 사라집니다.',
  '한 번 더 생각한 소비는 늘 더 현명합니다.',
  '오늘 아낀 돈이 내일의 선택지를 넓혀줍니다.',
  '진짜 필요한 것과 그냥 갖고 싶은 것을 구분해보세요.',
  '소비를 미루는 것도 훌륭한 저축입니다.',
  '잠깐 멈추면, 더 좋은 선택이 보입니다.',
];

function dayOfYear(date: Date): number {
  const start = new Date(date.getFullYear(), 0, 0);
  const diffMs = date.getTime() - start.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/** 매일 같은 날짜엔 같은 문구를, 날짜가 바뀌면 고정 배열에서 다른 문구를 선택한다 */
export function pickTodayQuote(date: Date = new Date()): string {
  const index = dayOfYear(date) % QUOTES.length;
  return QUOTES[index];
}
