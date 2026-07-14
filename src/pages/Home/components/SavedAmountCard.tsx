import { Link } from 'react-router-dom';
import pigIllustration from '../../../assets/pig.svg';
import { ROUTES } from '../../../routes/paths';
import { formatWon } from '../../../utils/format';

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
      className="flex items-center justify-between rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-white p-4 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)] lg:p-8"
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-[17px] font-medium text-black lg:text-[30px]">
          지금까지 절약한 금액
        </h2>
        <p className="text-black">
          <span className="text-[28px] font-medium lg:text-[50px]">
            {formatWon(totalSavedAmount)}
          </span>
          <span className="text-[15px] font-medium lg:text-[20px]">원</span>
        </p>
        <span className="w-fit rounded-md bg-[#eefff0] px-3 py-1.5 text-[10px] font-medium text-[#629f41] lg:text-[15px] lg:text-black">
          이번 달 + {formatWon(monthlySavedAmount)}원
        </span>
        <p className="text-[10px] font-medium text-black lg:text-[15px]">
          포기한 상품 {abandonedCount}개 | 구매한 상품 {purchasedCount}개
        </p>
      </div>
      <img
        src={pigIllustration}
        alt=""
        className="h-25 w-27 shrink-0 lg:h-32 lg:w-32"
      />
    </Link>
  );
}
