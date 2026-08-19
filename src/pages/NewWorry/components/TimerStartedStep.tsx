import { PartyPopper } from 'lucide-react';

interface TimerStartedStepProps {
  onGoToWorries: () => void;
}

/**
 * docs/plans/new-worry.md "타이머 생성 완료 스텝 상세" (`326:682` 기준).
 * 자동 리다이렉트는 없고 "고민 목록으로 가기" 버튼(243×44) 클릭으로만 이동한다.
 */
export function TimerStartedStep({ onGoToWorries }: TimerStartedStepProps) {
  return (
    <div className="mx-auto flex w-full max-w-105 flex-col items-center px-6 pt-20 pb-24 text-center">
      <div className="flex h-22 w-22 items-center justify-center rounded-full bg-[#e9f6e4]">
        <PartyPopper className="h-10 w-10 text-[#4fb75b]" aria-hidden="true" />
      </div>

      <h2 className="mt-6 text-[22px] font-bold text-black">
        24시간 고민을 시작합니다!
      </h2>
      <p className="mt-3 text-[14px] leading-5.5 text-[#666]">
        타이머가 시작되었습니다. 중간중간 작은 질문과 알림으로 더 현명한
        소비를 도와드릴게요.
      </p>

      <button
        type="button"
        onClick={onGoToWorries}
        className="mt-10 h-11 w-60.75 cursor-pointer rounded-[9px] bg-[#3e9b48] text-[15px] font-semibold text-white"
      >
        고민 목록으로 가기
      </button>
    </div>
  );
}
