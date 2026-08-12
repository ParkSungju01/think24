interface ConfirmModalProps {
  /** 모달 본문 문구. 전체삭제/개별삭제 각각 다른 문구를 그대로 전달받는다 */
  message: string;
  /** "네" 클릭 시 실행 (삭제 액션 실행 + 모달 닫기는 호출부 책임) */
  onConfirm: () => void;
  /** "아니요" 클릭 시 실행 (모달 닫기만, 개별삭제의 경우 스와이프 상태 복구도 호출부 책임) */
  onCancel: () => void;
}

/**
 * 이슈 #17 공용 확인 모달. 전체 알림 삭제 / 개별 알림 삭제 두 군데에서 문구와 콜백만
 * 바꿔 재사용한다 (docs/plans/mobile-notifications.md 실측 스펙: 260×100px 카드,
 * 98×24px 버튼 2개, bg-[#eefff0], rounded-[6px], 딤 배경 bg-black/40).
 *
 * 이슈 #39: fixed(브라우저 뷰포트 기준) → absolute(PhoneFrame 스크린 영역 기준)로 전환
 * (docs/plans/landing-phone-refactor.md 2-6) — PhoneFrame의 스크린 div가 relative
 * 포지셔닝 컨텍스트라 그 안에서 화면 전체를 덮는다.
 */
export function ConfirmModal({ message, onConfirm, onCancel }: ConfirmModalProps) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="flex h-25 w-65 flex-col items-center justify-center gap-3 rounded-md bg-white px-4"
        onClick={(event) => event.stopPropagation()}
      >
        <p className="text-center text-[15px] font-bold text-black">{message}</p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="h-6 w-24.5 rounded-md bg-[#eefff0] text-[14px] font-medium text-black"
          >
            네
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-6 w-24.5 rounded-md bg-[#eefff0] text-[14px] font-medium text-black"
          >
            아니요
          </button>
        </div>
      </div>
    </div>
  );
}
