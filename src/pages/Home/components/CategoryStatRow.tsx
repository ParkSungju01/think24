import { Triangle } from 'lucide-react';
import type { CategoryStat } from '../../../types/home';
import registWorriesIcon from '../../../assets/regist-worries.svg';
import givupProductIcon from '../../../assets/givup-product.svg';
import purchaseProductIcon from '../../../assets/purchase-product.svg';

const ICON_BY_KEY: Record<CategoryStat['key'], string> = {
  registered: registWorriesIcon,
  abandoned: givupProductIcon,
  purchased: purchaseProductIcon,
};

interface CategoryStatRowProps {
  stat: CategoryStat;
}

export function CategoryStatRow({ stat }: CategoryStatRowProps) {
  const icon = ICON_BY_KEY[stat.key];

  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        {/* 원본 svg 색상을 그대로 보존하기 위해 currentColor 마스킹 없이 img로 렌더링 */}
        <img src={icon} alt="" className="h-6 w-6" />
        <span className="text-[15px] font-medium text-black">
          {stat.label}
        </span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[40px] font-semibold text-black">
          {stat.count}건
        </span>
        {/* 확인 완료: 이번 범위는 증가 케이스만 구현, 감소 케이스 스타일은 이후 별도 정의 */}
        <span className="flex items-center gap-0.5 text-[13px] font-medium text-[#7ccf8a]">
          <Triangle className="h-2.5 w-2.5" fill="currentColor" strokeWidth={0} />
          지난 달 대비 +{stat.diffVsLastMonth}건
        </span>
      </div>
    </div>
  );
}
