// 알림 벨 드롭다운(`NotificationBell`) 알림 아이템 타입 (docs/plans/notifications.md 참고)
// 이번 이슈는 더미 데이터 5개만 다루는 범위이고, 실제 Supabase notifications 테이블 연동은 별도 이슈로 미룬다.
// 재구조화(별도 페이지 → 벨 드롭다운) 이후 alarm-exist.svg 아이콘은 아이템이 아니라
// NotificationBell 버튼 자체의 안읽음 상태 표시로만 쓰인다. thumbnailUrl은 그것과 별개로,
// 아이템 왼쪽에 표시하는 "고민(상품) 썸네일"이라 다시 추가했다.
export interface NotificationItem {
  id: string;
  /** 고민명. 화면에는 항상 작은따옴표로 감싸 제목처럼 표시한다 (예: '치즈 말랑이') */
  worryName: string;
  /** 알림 본문 설명 */
  message: string;
  /**
   * 상대 시간 표시 문자열(예: "13시간 전"). 더미 데이터 단계라 실제 Date 값을 저장해두고
   * 매 렌더마다 계산하는 대신, 화면에 보일 값을 그대로 저장한다(실시간 갱신 불필요).
   */
  createdAt: string;
  /** 읽음 여부. 아이템 클릭 시 true로 바뀌며 새로고침하면 초기화돼도 무방(영속화 불필요, 확인 완료) */
  isRead: boolean;
  /** 고민(상품) 썸네일. 없으면 WorryListItem과 동일한 패턴으로 회색 placeholder 박스를 대신 표시한다 */
  thumbnailUrl?: string;
}
