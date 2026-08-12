import { Link } from "react-router-dom";
import pigIllustration from "../../../assets/pig.svg";
import { ROUTES } from "../../../routes/paths";
import { formatWon } from "../../../utils/format";
import { Triangle } from "lucide-react";

interface SavedAmountCardProps {
  totalSavedAmount: number;
  monthlySavedAmount: number;
  abandonedCount: number;
  purchasedCount: number;
}

export function SavedAmountCard({
  totalSavedAmount,
  monthlySavedAmount,
  abandonedCount,
  purchasedCount,
}: SavedAmountCardProps) {
  return (
    // 확인 완료: 카드 전체 클릭 시 소비 기록(/records) 화면으로 이동
    <Link
      to={ROUTES.records}
      className="flex items-center justify-between rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-white p-4 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)]"
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-[17px] font-medium text-black">
          지금까지 절약한 금액
        </h2>
        {/* flex-wrap과 배지 whitespace-nowrap은 폭이 좁아진 상태에서도 배지가 글자 단위로 쪼개지지
            않고 통째로 다음 줄로 내려가도록 하는 안전장치(WorryListItem과 동일한 패턴) */}
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-black">
            <span className="text-[28px] font-medium">
              {formatWon(totalSavedAmount)}
            </span>
            <span className="text-[15px] font-medium">원</span>
          </p>
          <span className="flex w-fit items-center gap-1 rounded-md bg-[#eefff0] px-3 py-1.5 text-[10px] font-medium whitespace-nowrap text-[#629f41]">
            <Triangle className="h-3.25 w-3.25" fill="#7ccf8a" strokeWidth={0} />
            이번 달 + {formatWon(monthlySavedAmount)}원
          </span>
        </div>
        <p className="text-[10px] font-medium text-black">
          포기한 상품 {abandonedCount}개 | 구매한 상품 {purchasedCount}개
        </p>
      </div>
      <img src={pigIllustration} alt="" className="h-25 w-27 shrink-0" />
    </Link>
  );
}
