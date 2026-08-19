import type { NotificationItem } from '../types/notifications';

// docs/plans/local-only-migration.md "3. 알림 mock 전환": Supabase CRUD 대신 정적 배열 하나만
// export한다. NotificationsContext가 mount 시 이 배열을 초기 상태로 얹고, 읽음/삭제는 전부
// 컴포넌트 상태로만 처리한다(영속화 없음 — ADR-0004와 동일한 패턴).

const HOUR_MS = 60 * 60 * 1000;
const now = Date.now();

export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'mock-notification-1',
    worryId: 'seed-ongoing-half',
    worryName: '무선 청소기',
    message: '24시간 타이머가 곧 종료돼요. 아직 결정하지 못했다면 지금 확인해보세요.',
    createdAt: new Date(now - 1 * HOUR_MS),
    isRead: false,
    thumbnailUrl: null,
  },
  {
    id: 'mock-notification-2',
    worryId: 'seed-pending-1',
    worryName: '블루투스 키보드',
    message: '타이머가 종료됐어요. 구매할지 포기할지 결정해주세요.',
    createdAt: new Date(now - 3 * HOUR_MS),
    isRead: false,
    thumbnailUrl: null,
  },
  {
    id: 'mock-notification-3',
    // 현재 시드에는 일시정지 예시가 없어(개발 편의용 세부 조정, docs/plans/local-only-migration.md
    // 원안과 다름) 이 알림이 가리키던 고민이 실제로 존재하지 않는다. mock-notification-4와
    // 동일하게 worryId를 null로 둬 존재하지 않는 id를 참조하지 않게 한다.
    worryId: null,
    worryName: '캡슐 커피 머신',
    message: '고민을 일시정지했어요. 준비되면 다시 시작해보세요.',
    createdAt: new Date(now - 13 * HOUR_MS),
    isRead: true,
    thumbnailUrl: null,
  },
  {
    id: 'mock-notification-4',
    worryId: null,
    worryName: '스탠딩 데스크',
    message: '포기를 선택했어요. 잘 참으셨어요!',
    createdAt: new Date(now - 30 * HOUR_MS),
    isRead: true,
    thumbnailUrl: null,
  },
];
