interface PurchaseConfirmModalProps {
  onCancel: () => void;
  onConfirmPurchase: () => void;
}

/**
 * 결정 시트에서 "구매하기"를 누르면 뜨는 재확인 모달. 실수로 확정하지 않도록 한 번 더 묻는다.
 * "조금 더 고민하기"를 누르면 이 모달만 닫히고(결정 시트는 그대로 열려 있음) 사용자는 다시
 * 포기/구매를 고를 수 있다. `DeleteWorryModal`과 동일한 시각 스펙(310px 카드, rounded-[14px],
 * outline/filled 버튼 2개)을 재사용해 이 화면 안에서 톤이 튀지 않게 했다(신규 요구사항이라
 * 피그마 실측 없음).
 */
export function PurchaseConfirmModal({
  onCancel,
  onConfirmPurchase,
}: PurchaseConfirmModalProps) {
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
        <h2 className="text-[18px] font-bold text-black">
          정말 구매하시겠습니까?
        </h2>

        <div className="flex w-full gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-12 flex-1 cursor-pointer rounded-[10px] border border-[#dedede] bg-white text-[14px] font-semibold text-black"
          >
            조금 더 고민하기
          </button>
          <button
            type="button"
            onClick={onConfirmPurchase}
            className="h-12 flex-1 cursor-pointer rounded-[10px] bg-[#3e9b48] text-[14px] font-semibold text-white"
          >
            구매하기
          </button>
        </div>
      </div>
    </div>
  );
}
