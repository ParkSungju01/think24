interface DeleteWorryModalProps {
  worryName: string;
  onCancel: () => void;
  onConfirmDelete: () => void;
}

/**
 * docs/plans/worries-list.md 화면 3 — 진행 중/일시정지 카드의 "✕"에서 뜨는 삭제 확인 모달.
 * 기존 `ConfirmModal`(알림 삭제용, 260×100 텍스트 버튼 2개)과 시각 스펙이 크게 달라 재사용하지
 * 않고 전용 컴포넌트로 구현(계획서 확정 사항).
 *
 * "삭제"는 실제 DB delete가 아니라 확정/일시정지와 동일하게 로컬 오버레이(deletedIds)로만
 * 화면에서 제외한다 — 새로고침하면 다시 나타난다(ADR-0004 확장 범위). 본문 카피는 원본 피그마의
 * "소비 기록에도 남지 않아요" 문구가 이 동작과 맞지 않아 계획서에서 확정된 문구로 교체함.
 */
export function DeleteWorryModal({
  worryName,
  onCancel,
  onConfirmDelete,
}: DeleteWorryModalProps) {
  return (
    <div
      className="absolute inset-0 z-50 flex items-center justify-center bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="flex w-[310px] flex-col items-center gap-4 rounded-[14px] bg-white px-6 py-7"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#fbe4e1]">
          <span className="text-[24px] font-bold text-[#e05b4e]">!</span>
        </div>

        <h2 className="text-[18px] font-bold text-black">
          이 고민을 삭제할까요?
        </h2>
        <p className="text-center text-[13px] text-[#666]">
          {worryName}의 타이머와 AI 분석 기록이 이 목록에서 사라집니다.
        </p>

        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 flex-1 cursor-pointer rounded-[10px] border border-[#dedede] bg-white font-semibold text-black"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onConfirmDelete}
            className="h-12 flex-1 cursor-pointer rounded-[10px] bg-[#e05b4e] font-semibold text-white"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
}
