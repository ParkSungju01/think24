// 알림 벨 드롭다운(`NotificationBell`) 알림 아이템 타입 (docs/plans/notifications.md 참고)
// 이슈 #31: Supabase public.notifications 테이블 기반 실데이터로 전환. src/lib/notifications.ts가
// snake_case row(worry_id/thumbnail_url/is_read/created_at 등)를 이 camelCase 형태로 정규화한다
// (worries.ts의 WorryRecord/WorryRow 패턴과 동일).
// 재구조화(별도 페이지 → 벨 드롭다운) 이후 alarm-exist.svg 아이콘은 아이템이 아니라
// NotificationBell 버튼 자체의 안읽음 상태 표시로만 쓰인다. thumbnailUrl은 그것과 별개로,
// 아이템 왼쪽에 표시하는 "고민(상품) 썸네일"이라 다시 추가했다.
export interface NotificationItem {
  id: string;
  /**
   * 알림 생성 시점에 연관된 worries.id (soft reference, FK `on delete set null`). 고민이
   * 나중에 삭제되면 null이 될 수 있다. "해당 타이머로 이동" 기능은 이번 이슈 범위 밖이라
   * 아직 사용하지 않지만, 향후 클릭 시 이동 기능을 위해 타입에는 미리 반영해둔다.
   */
  worryId: string | null;
  /** 고민명. 화면에는 항상 작은따옴표로 감싸 제목처럼 표시한다 (예: '치즈 말랑이') */
  worryName: string;
  /** 알림 본문 설명 */
  message: string;
  /**
   * 알림 생성 시각. DB의 timestamptz(created_at)를 Date로 정규화해 저장하고,
   * "13시간 전" 같은 상대 시간 문자열은 렌더링 시점에 utils/format.ts의
   * formatRelativeTime으로 매번 계산한다(WorryListItem이 deadlineAt을 다루는 방식과 동일).
   */
  createdAt: Date;
  /** 읽음 여부. 아이템 클릭 시 true로 바뀌며 Supabase notifications.is_read에 영속화된다 */
  isRead: boolean;
  /** 고민(상품) 썸네일. 없으면 WorryListItem과 동일한 패턴으로 회색 placeholder 박스를 대신 표시한다 */
  thumbnailUrl: string | null;
}
