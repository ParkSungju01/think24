import bulbIcon from "../../../assets/electric_bulb.svg";

interface TodayQuoteCardProps {
  quote: string | null;
}

export function TodayQuoteCard({ quote }: TodayQuoteCardProps) {
  return (
    <div className="flex h-auto w-full items-center gap-4 rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-[#f4fbef] px-4 py-3 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)] xl:h-41.25 xl:px-8">
      <div className="flex h-full items-start">
        <img src={bulbIcon} alt="" className="h-8.5 w-7 shrink-0 xl:h-15.5 xl:w-13" />
      </div>
      <div className="flex flex-col gap-1 lg:gap-4">
        <div>
          <p className="text-[15px] font-semibold lg:text-[16px] xl:text-[35px]">오늘의 소비 한줄</p>
        </div>
        <p className="text-[13px] font-medium text-black lg:text-[14px] xl:text-[30px]">
          {/* 빈 문자열도 "없음"으로 취급해야 해서 falsy 체크 (?? 는 ''를 걸러내지 못함) */}
          {quote || "오늘 참은 소비가 내일의 여유가 됩니다"}
        </p>
      </div>
    </div>
  );
}
