import registWorriesIcon from "../../../assets/regist-worries.svg";
import givupProductIcon from "../../../assets/givup-product.svg";
import purchaseProductIcon from "../../../assets/purchase-product.svg";
import cn from "../../../utils/cn";

interface WorryCountsCardProps {
  registeredCount: number;
  abandonedCount: number;
  purchasedCount: number;
}

interface CountColumn {
  key: string;
  icon: string;
  iconClassName: string;
  label: string;
  count: number;
}

/** 등록/포기/구매 3분할 카드(348:641, 아이콘 348:644/349:675/349:684). 카드 100% 폭을
 * 3등분해 각 컬럼에 아이콘 → 라벨 → 건수를 세로로 쌓는다(피그마 실측 y 순서 그대로). */
export function WorryCountsCard({
  registeredCount,
  abandonedCount,
  purchasedCount,
}: WorryCountsCardProps) {
  const columns: CountColumn[] = [
    {
      key: "registered",
      icon: registWorriesIcon,
      iconClassName: "h-7 w-7",
      label: "등록한 고민",
      count: registeredCount,
    },
    {
      key: "abandoned",
      icon: givupProductIcon,
      iconClassName: "h-9 w-8",
      label: "포기한 상품",
      count: abandonedCount,
    },
    {
      key: "purchased",
      icon: purchaseProductIcon,
      iconClassName: "h-7 w-7",
      label: "구매한 상품",
      count: purchasedCount,
    },
  ];

  return (
    <div className="flex w-full items-start justify-between rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-white p-3 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)]">
      {columns.map((column) => (
        <div
          key={column.key}
          className="flex flex-1 flex-col items-center gap-1"
        >
          <div className={cn("flex h-13 w-13 items-center justify-center rounded-full", column.key === "registered" ? "bg-[#BCE6C1]" : column.key === "abandoned" ? "bg-[#F3C163]" : "bg-[#EE7680]")}>
            <img src={column.icon} alt="" className={column.iconClassName} />
          </div>
          <p className="text-[13px] font-medium text-[#666]">{column.label}</p>
          <p className="text-[20px] font-semibold text-black">
            {column.count}건
          </p>
        </div>
      ))}
    </div>
  );
}
