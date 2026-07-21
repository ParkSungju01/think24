import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Trash2 } from 'lucide-react';
import type { NotificationItem } from '../../../types/notifications';

interface NotificationSwipeableListItemProps {
  notification: NotificationItem;
  /** 이 아이템의 삭제 버튼이 열려 있는지. 한 번에 하나만 열리도록 부모가 단일 id로 관리 (확인 완료) */
  isOpen: boolean;
  /** 스와이프/클릭으로 이 아이템을 열 때 호출 (부모가 다른 아이템은 자동으로 닫는다) */
  onOpen: () => void;
  /** 스와이프/클릭으로 이 아이템을 닫을 때 호출 */
  onClose: () => void;
  /** 본문(스와이프 버튼이 아닌 영역) 탭 시 markAsRead 호출용 */
  onItemClick: () => void;
  /** 삭제 버튼(휴지통) 탭 시 개별 삭제 확인 모달을 열기 위해 호출 */
  onRequestDelete: () => void;
}

// 삭제 버튼 실측(130:230): 40×35px, 각진 사각형(라운드 없음), bg-[#ec2d30]
const DELETE_BUTTON_WIDTH = 40;
// pointerdown~up 사이 이동량이 이 값 미만이면 "드래그"가 아니라 "클릭/탭"으로 간주
const DRAG_THRESHOLD = 8;

/**
 * 이슈 #17 개별 삭제 스와이프 아이템. 기존 NotificationListItem의 dot-썸네일-텍스트
 * 레이아웃은 그대로 두고, 오른쪽에 빨강 삭제 버튼을 숨겨뒀다가 pointer 이벤트 기반
 * 스와이프(오→왼)로 노출한다. 새 제스처 라이브러리는 쓰지 않는다(계획서: 최소 의존성 우선).
 *
 * 마우스 폴백(오케스트레이터 확인): 터치 스와이프뿐 아니라 클릭만으로도 삭제 버튼을
 * 열고 닫을 수 있어야 한다. Pointer Events는 마우스/터치 모두에서 동일하게 발생하므로,
 * 이동량이 DRAG_THRESHOLD 미만인 "제자리 클릭/탭"을 아래처럼 분기 처리한다:
 *  - 이미 열려 있는 상태에서 제자리 클릭/탭 → 그냥 닫기(복구). 터치의 "왼→오 스와이프로
 *    복구"와 동일한 결과를 클릭으로도 낼 수 있게 한다.
 *  - 닫혀 있는 상태에서 제자리 클릭(마우스) → 삭제 버튼을 연다. 마우스는 실제 스와이프
 *    동작을 하기 어려우므로 클릭 자체가 스와이프의 대체 트리거가 된다(요청사항: "데스크톱
 *    브라우저에서 접근했을 때도 동작해야 함").
 *  - 닫혀 있는 상태에서 제자리 탭(터치) → 기존 스펙대로 markAsRead만 호출(이동 없음).
 * 실제로 이동량이 임계값 이상인 드래그가 발생하면 포인터 종류와 무관하게 방향에 따라
 * 열기/닫기를 결정한다(터치 스와이프 및 마우스 클릭-드래그 공통 경로).
 */
export function NotificationSwipeableListItem({
  notification,
  isOpen,
  onOpen,
  onClose,
  onItemClick,
  onRequestDelete,
}: NotificationSwipeableListItemProps) {
  const { worryName, message, createdAt, isRead, thumbnailUrl } = notification;
  const [dragDx, setDragDx] = useState(0);
  // isDragging은 렌더링(transform/transition 계산)에 쓰이므로 ref가 아니라 state로 둔다.
  // (ref.current를 렌더 중에 읽으면 react-hooks/refs 규칙 위반 — 렌더에는 항상 state만 사용)
  const [isDragging, setIsDragging] = useState(false);
  // startX/pointerType은 이벤트 핸들러 안에서만 읽고 렌더링에는 쓰지 않으므로 ref로 보관해도 안전하다.
  const pointerState = useRef<{ startX: number; pointerType: string } | null>(null);

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    pointerState.current = { startX: event.clientX, pointerType: event.pointerType };
    setIsDragging(false);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = pointerState.current;
    if (!state) return;
    const delta = event.clientX - state.startX;
    if (Math.abs(delta) > DRAG_THRESHOLD) {
      setIsDragging(true);
    }
    // 열린 상태에서는 -40~0, 닫힌 상태에서는 0을 기준으로 좌우 드래그 값을 -40~0 범위로 clamp
    const base = isOpen ? -DELETE_BUTTON_WIDTH : 0;
    const next = Math.min(0, Math.max(-DELETE_BUTTON_WIDTH, base + delta));
    setDragDx(next);
  };

  const handlePointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const state = pointerState.current;
    const wasDragging = isDragging;
    setIsDragging(false);
    setDragDx(0);
    pointerState.current = null;
    if (!state) return;
    const delta = event.clientX - state.startX;

    if (wasDragging) {
      // 실제 드래그(터치 스와이프 또는 마우스 클릭-드래그) → 이동 방향/거리로 열기/닫기 판단
      if (delta < -DELETE_BUTTON_WIDTH / 2) {
        onOpen();
      } else if (delta > DELETE_BUTTON_WIDTH / 2) {
        onClose();
      } else {
        // 임계값을 못 넘었으면 원래 상태 유지
        if (isOpen) onOpen();
        else onClose();
      }
    } else {
      // 이동량이 거의 없는 제자리 클릭/탭
      if (isOpen) {
        // 열려 있을 때는 터치/마우스 공통으로 닫기(복구)
        onClose();
      } else if (state.pointerType === 'mouse') {
        // 마우스 폴백: 닫힌 상태에서의 클릭은 스와이프 대체 트리거로 삭제 버튼을 연다
        onOpen();
      } else {
        // 터치: 닫힌 상태에서의 탭은 기존 스펙대로 읽음 처리만
        onItemClick();
      }
    }
  };

  // 드래그 중에는 pointermove에서 계산한 실시간 값(dragDx)을, 아니면 열림/닫힘 확정 위치를 사용
  const offset = isDragging ? dragDx : isOpen ? -DELETE_BUTTON_WIDTH : 0;

  return (
    <div className="relative overflow-hidden border-b border-[#f0f0f0] last:border-b-0">
      {/* 삭제 버튼: 아이템 뒤에 항상 존재하고, 콘텐츠가 왼쪽으로 밀리면서 드러난다 */}
      <button
        type="button"
        aria-label="알림 삭제"
        onClick={onRequestDelete}
        className="absolute right-0 top-0 flex h-full w-10 items-center justify-center bg-[#ec2d30]"
      >
        <Trash2 className="h-6.5 w-6.5 text-white" />
      </button>
      <div
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        style={{
          transform: `translateX(${offset}px)`,
          transition: isDragging ? 'none' : 'transform 200ms ease-out',
          touchAction: 'pan-y',
        }}
        // 실측(Playwright, 375px 뷰포트): 헤더 케밥 아이콘(MoreVertical 24×24, 버튼 h-8 안에서
        // 4px 인셋)의 오른쪽 끝과 이 시간 텍스트 오른쪽 끝이 기존 px-3(우측 12px)로는 4px
        // 어긋나 있었다. justify-between 안에서는 span 자체의 padding-right가 오른쪽 끝을
        // 옮기지 못해(오른쪽 끝이 부모 우측 경계에 고정되는 flex 특성) 이 행 전체의 우측
        // 패딩을 pr-4(16px)로 늘려 케밥 아이콘과 세로 정렬을 맞춘다.
        className="relative flex w-full items-start gap-2 bg-white py-3 pr-7 pl-3 text-left"
      >
        <span
          className={`h-2 w-2 shrink-0 self-center rounded-full bg-[#a9d592] ${
            isRead ? 'invisible' : ''
          }`}
          aria-hidden="true"
        />
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt=""
            className="h-10 w-10 shrink-0 rounded-[10px] object-cover"
          />
        ) : (
          <div
            className="h-10 w-10 shrink-0 rounded-[10px] bg-[#f5f5f5]"
            aria-hidden="true"
          />
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <div className="flex items-center justify-between gap-2">
            <p className="min-w-0 truncate text-[11px] font-semibold text-black">
              '{worryName}'
            </p>
            <span className="shrink-0 whitespace-nowrap text-[9px] font-medium text-[#666]">
              {createdAt}
            </span>
          </div>
          <p className="text-[9px] font-medium text-[#666]">{message}</p>
        </div>
      </div>
    </div>
  );
}
