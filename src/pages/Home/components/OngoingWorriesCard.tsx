import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { OngoingWorry } from '../../../types/home';
import { ROUTES } from '../../../routes/paths';
import { WorryListItem } from './WorryListItem';

interface OngoingWorriesCardProps {
  worries: OngoingWorry[];
}

export function OngoingWorriesCard({ worries }: OngoingWorriesCardProps) {
  return (
    <div className="flex flex-1 flex-col gap-6 rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-white p-4 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)] xl:p-8">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-semibold text-black lg:text-[16px] xl:text-[30px]">
          진행 중인 고민
        </h2>
        <Link
          to={ROUTES.worries}
          className="flex items-center gap-1 font-semibold text-black xl:text-[13px] lg:text-[20px]"
        >
          전체 보기
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>

      {worries.length === 0 ? (
        <p className="text-[15px] font-medium text-[#666]">
          등록된 고민이 없어요
        </p>
      ) : (
        <div className="flex flex-col gap-4 lg:gap-6">
          {worries.slice(0, 2).map((worry) => (
            <WorryListItem key={worry.id} worry={worry} />
          ))}
        </div>
      )}
    </div>
  );
}
