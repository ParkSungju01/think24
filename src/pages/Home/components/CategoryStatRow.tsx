import { Triangle } from "lucide-react";
import type { CategoryStat } from "../../../types/home";
import registWorriesIcon from "../../../assets/regist-worries.svg";
import givupProductIcon from "../../../assets/givup-product.svg";
import purchaseProductIcon from "../../../assets/purchase-product.svg";

const ICON_BY_KEY: Record<CategoryStat["key"], string> = {
  registered: registWorriesIcon,
  abandoned: givupProductIcon,
  purchased: purchaseProductIcon,
};

const ICON_BG_COLOR_BY_KEY: Record<CategoryStat["key"], string> = {
  registered: "bg-[#7ccf8a]",
  abandoned: "bg-[#f3c163]",
  purchased: "bg-[#ee7680]",
};

interface CategoryStatRowProps {
  stat: CategoryStat;
}

export function CategoryStatRow({ stat }: CategoryStatRowProps) {
  const icon = ICON_BY_KEY[stat.key];
  const iconBgColor = ICON_BG_COLOR_BY_KEY[stat.key];

  return (
    <div className="flex items-center gap-5.75">
      <div className="flex items-center gap-3">
        {/* 원본 svg 색상을 그대로 보존하기 위해 currentColor 마스킹 없이 img로 렌더링 */}
        <div
          className={`flex size-31.75 items-center justify-center rounded-full ${iconBgColor}`}
        >
          <img src={icon} alt="" className="size-17.25" />
        </div>
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[25px] font-medium text-[#666]">{stat.label}</span>
        <span className="text-[40px] font-semibold text-black">
          {stat.count}건
        </span>
        {stat.diffVsLastMonth !== 0 && (
          <span className="flex items-center gap-0.5 text-[13px] font-medium text-black">
            지난 달 대비
            <Triangle
              className={`h-2.5 w-2.5 ${
                stat.diffVsLastMonth > 0
                  ? 'text-[#7ccf8a]'
                  : 'rotate-180 text-[#ee7680]'
              }`}
              fill="currentColor"
              strokeWidth={0}
            />
            {Math.abs(stat.diffVsLastMonth)}건
          </span>
        )}
      </div>
    </div>
  );
}
