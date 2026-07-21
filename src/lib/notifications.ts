import type { NotificationItem } from '../types/notifications';

// 상품 등록/실사 이미지 업로드 기능이 아직 없어(HomeData의 OngoingWorry.thumbnailUrl과 동일한 사정,
// docs/plans 확인 완료 사항) 실제 이미지 파일을 새로 추가하는 대신, 데모용 인라인 SVG data URI 2개로
// "이미지가 있는 케이스"만 흉내낸다. 나머지 아이템은 thumbnailUrl을 비워 placeholder 케이스를 보여준다.
const sampleThumbnail = (fill: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80"><rect width="80" height="80" rx="16" fill="${fill}"/></svg>`,
  )}`;

// 확인 완료: 이번 이슈는 Supabase 연동 없이 더미 데이터 5개만 사용한다 (docs/plans/notifications.md 참고)
// 최신순 정렬(배열 맨 앞 = 최신). thumbnailUrl은 일부러 절반만 채워서 이미지/placeholder 두 케이스를
// 다 확인할 수 있게 한다.
export const dummyNotifications: NotificationItem[] = [
  {
    id: '1',
    worryName: '치즈 말랑이',
    message: '타이머가 종료됐어요. 구매할지 포기할지 결정해주세요.',
    createdAt: '13시간 전',
    isRead: false,
    thumbnailUrl: sampleThumbnail('#a9d592'),
  },
  {
    id: '2',
    worryName: '무선 이어폰',
    message: '타이머 종료까지 1시간 남았어요.',
    createdAt: '1일 전',
    isRead: false,
  },
  {
    id: '3',
    worryName: '캠핑 의자',
    message: '고민을 포기했어요. 절약 금액이 적립됐습니다.',
    createdAt: '2일 전',
    isRead: true,
    thumbnailUrl: sampleThumbnail('#f0b429'),
  },
  {
    id: '4',
    worryName: '블루투스 키보드',
    message: '고민을 구매로 완료했어요.',
    createdAt: '3일 전',
    isRead: true,
  },
  {
    id: '5',
    worryName: '가죽 다이어리',
    message: '새로운 고민이 등록됐어요.',
    createdAt: '5일 전',
    isRead: true,
  },
];
