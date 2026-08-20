interface PurchaseConfirmModalProps {
  /** 굵게 강조되는 주 문구. */
  title: string;
  /** title 아래 회색 보조 문구(선택). */
  subtitle?: string;
  onCancel: () => void;
  onConfirmPurchase: () => void;
}

/**
 * "구매하기"를 실수로 바로 확정하지 않도록 한 번 더 묻는 재확인 모달. 두 곳에서 문구만 바꿔
 * 재사용한다:
 *  - 결정 시트(마감 지난 고민)의 "구매하기" → title="정말 구매하시겠습니까?" (subtitle 없음)
 *  - ongoing 카드의 "지금 결정하기"(이슈 #51, 일시정지 버튼 대체) → title="지금
 *    결정하시겠어요?" + subtitle="아직 24시간이 지나지 않았어요."
 * 두 경우 모두 "조금 더 고민하기"를 누르면 이 모달만 닫히고(뒤에 있던 화면/시트는 그대로
 * 유지) 사용자는 다시 고를 수 있다. `DeleteWorryModal`과 동일한 시각 스펙(310px 카드,
 * rounded-[14px], outline/filled 버튼 2개)을 재사용해 이 화면 안에서 톤이 튀지 않게 했다
 * (신규 요구사항이라 피그마 실측 없음).
 */
export function PurchaseConfirmModal({
  title,
  subtitle,
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
        <div className="flex flex-col items-center gap-1">
          <h2 className="text-[18px] font-bold text-black">{title}</h2>
          {subtitle && (
            <p className="text-[13px] text-[#666]">{subtitle}</p>
          )}
        </div>

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
