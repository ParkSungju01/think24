interface LoadMoreButtonProps {
  hiddenCount: number;
  onClick: () => void;
}

/** 실측: 342×44 → w-full h-11 rounded-[10px] border border-[#dedede] bg-white. 숨겨진 개수가
 * 0이면(이미 전부 보이는 중) 렌더링하지 않는다 — 호출부에서 hiddenCount === 0 체크. */
export function LoadMoreButton({ hiddenCount, onClick }: LoadMoreButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-11 w-full rounded-[10px] border border-[#dedede] bg-white text-[14px] font-medium text-black"
    >
      더 보기 ({hiddenCount}건 남음)
    </button>
  );
}
