import { Link } from "react-router-dom";
import pigIllustration from "../../../assets/pig.svg";
import { ROUTES } from "../../../routes/paths";
import { formatWon } from "../../../utils/format";

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
      className="flex items-center justify-between rounded-[14px] border border-[rgba(188,230,193,0.55)] bg-white p-4 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)] xl:p-8"
    >
      <div className="flex flex-col gap-4">
        <h2 className="text-[17px] font-medium text-black lg:text-[18px] xl:text-[30px]">
          지금까지 절약한 금액
        </h2>
        {/* 리뷰 재작업: 금액/배지/하단 문구에 반응형 클래스가 전혀 없어 425px+(사이드바 등장, lg 구간)에서
            데스크톱 크기(50px 등)가 그대로 유지되며 글자 단위로 줄바꿈되는 문제가 있었다. 피그마 모바일 실측값
            (금액 28px+15px, 배지 10px/#629f41, 하단 문구 10px)을 기본값으로 채우고 xl(1024px)부터 기존
            데스크톱 값으로 전환하도록 보정. flex-wrap과 배지 whitespace-nowrap은 425~1023px(lg) 구간처럼
            사이드바로 폭이 좁아진 상태에서도 배지가 글자 단위로 쪼개지지 않고 통째로 다음 줄로 내려가도록 하는
            안전장치(WorryListItem 재작업 때와 동일한 패턴) */}
        <div className="flex flex-wrap items-center gap-4">
          <p className="text-black">
            <span className="text-[28px] font-medium xl:text-[50px]">
              {formatWon(totalSavedAmount)}
            </span>
            <span className="text-[15px] font-medium xl:text-[20px]">원</span>
          </p>
          <span className="w-fit rounded-md bg-[#eefff0] px-3 py-1.5 text-[10px] font-medium whitespace-nowrap text-[#629f41] xl:text-[15px] xl:text-black">
            이번 달 + {formatWon(monthlySavedAmount)}원
          </span>
        </div>
        <p className="text-[10px] font-medium text-black xl:text-[15px]">
          포기한 상품 {abandonedCount}개 | 구매한 상품 {purchasedCount}개
        </p>
      </div>
      <img
        src={pigIllustration}
        alt=""
        className="h-25 w-27 shrink-0 lg:h-14 lg:w-15 xl:h-32 xl:w-32"
      />
    </Link>
  );
}
