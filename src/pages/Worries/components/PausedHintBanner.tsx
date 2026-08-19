/**
 * 실측(499:1359): 342×52 → w-full rounded-[10px] bg-[#e9f6e4] p-4, 텍스트 2줄.
 * "일시정지" 필터 선택 시에만 카드 리스트 다음/"더 보기" 앞에 노출.
 */
export function PausedHintBanner() {
  return (
    <div className="w-full rounded-[10px] bg-[#e9f6e4] p-4">
      <p className="text-[12px] text-[#3e9b48]">
        멈춰둔 고민은 시간이 흐르지 않아요.
      </p>
      <p className="text-[12px] text-[#3e9b48]">
        재개하면 남은 시간부터 다시 카운트됩니다.
      </p>
    </div>
  );
}
