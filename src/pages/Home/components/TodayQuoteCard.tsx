import bulbIcon from '../../../assets/electric_bulb.svg';

interface TodayQuoteCardProps {
  quote: string | null;
}

export function TodayQuoteCard({ quote }: TodayQuoteCardProps) {
  return (
    <div className="flex w-[1375px] items-center gap-4 rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-[#f4fbef] p-8 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)]">
      <img src={bulbIcon} alt="" className="h-8 w-8 shrink-0" />
      <p className="text-[15px] font-medium text-black">
        {quote ?? '오늘의 소비 한 줄이 아직 없어요'}
      </p>
    </div>
  );
}
