import { Triangle } from 'lucide-react';
import logo from '../../assets/logo.svg';
import { formatWon } from '../../utils/format';

// 로그인/회원가입 화면 좌측 마케팅 패널 (피그마 182:171, 182:233 공용).
// 이번 달 절약액 등은 서비스 전체 집계 정의가 아직 보류 상태(docs/plans/backend-setup.md)라
// 사용자 확인 완료 사항대로 정적 값을 하드코딩한다.
const TOTAL_SAVED_AMOUNT = 111_111_111;
const MONTHLY_SAVED_AMOUNT = 11_000;

export function BrandPanel() {
  return (
    <div className="hidden shrink-0 flex-col justify-between bg-[#e9f6e4] p-18 font-noto xl:flex xl:w-140">
      <div className="flex flex-col gap-8">
        <div className="flex items-center gap-3.5">
          <img src={logo} alt="" className="h-23.25 w-23" />
          <span className="text-[50px] font-bold text-[#1f2420]">멈칫</span>
        </div>

        <div className="flex flex-col gap-8">
          <p className="text-[30px] leading-[42px] font-bold text-[#1f2420]">
            잠시 멈추면
            <br />더 좋은 선택이 보입니다.
          </p>
          <p className="text-[15px] leading-[24px] text-[#899086]">
            구매 전 잠깐의 멈춤이
            <br />
            당신의 절약 습관을 만들어 갑니다.
          </p>

          <div className="flex flex-col gap-2 rounded-2xl bg-white p-7">
            <p className="text-[13px] font-medium text-[#899086]">
              멈칫 유저들이 지금까지 아낀 금액
            </p>
            <p className="text-[30px] font-bold text-[#3e9b48]">
              {formatWon(TOTAL_SAVED_AMOUNT)}원
            </p>
            <span className="flex w-fit items-center gap-1 rounded-full bg-[#dff3d8] px-2.5 py-1 text-[12px] font-medium text-[#3e9b48]">
              <Triangle className="h-2.5 w-2.5" fill="#3e9b48" strokeWidth={0} />
              이번 달 + {formatWon(MONTHLY_SAVED_AMOUNT)}원
            </span>
          </div>
        </div>
      </div>

      <p className="text-[12px] text-[#899086]">
        © 2026 Meomchit. All rights reserved.
      </p>
    </div>
  );
}
