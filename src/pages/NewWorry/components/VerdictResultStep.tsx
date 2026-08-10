import successIcon from '../../../assets/success.svg';
import dangerIcon from '../../../assets/danger.svg';
import { Spinner } from '../../../components/Spinner';
import type { AiVerdict, AiVerdictScore } from '../../../types/newWorry';

interface VerdictResultStepProps {
  verdict: AiVerdict;
  isSubmitting: boolean;
  onStartTimer: () => void;
  onGoHome: () => void;
}

const SCORE_ROWS: { key: keyof AiVerdict['scores']; label: string }[] = [
  { key: 'necessity', label: '필요성' },
  { key: 'impulsiveness', label: '충동성' },
  { key: 'priceFit', label: '가격 적정성' },
];

function ScoreRow({ label, score }: { label: string; score: AiVerdictScore }) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-[14px] xl:text-[19px]">
        <span className="font-medium text-black">{label}</span>
        <span className="font-semibold text-[#3e9b48]">
          {score.percent}% · {score.label}
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-[#eeeeee] xl:h-3">
        <div
          className="h-full rounded-full bg-[#4fb75b]"
          style={{ width: `${Math.min(100, Math.max(0, score.percent))}%` }}
        />
      </div>
    </div>
  );
}

/**
 * docs/plans/new-worry.md "AI 판정 결과 스텝 상세" (`334` 클러스터 — 카피가 정확한 사본 기준).
 * 확인 완료: AI 판정과 무관하게 두 버튼 모두 항상 클릭 가능(자동 분기 없음).
 */
export function VerdictResultStep({
  verdict,
  isSubmitting,
  onStartTimer,
  onGoHome,
}: VerdictResultStepProps) {
  const isNecessary = verdict.verdict === 'necessary';

  return (
    <div className="mx-auto flex w-full max-w-105 flex-col items-center px-6 pt-10 pb-24 text-center lg:pt-14 xl:max-w-140 xl:pt-20">
      <img
        src={isNecessary ? successIcon : dangerIcon}
        alt=""
        className={
          isNecessary
            ? 'h-22.75 w-22.75 xl:h-30 xl:w-30'
            : 'h-25.5 w-25.5 xl:h-34 xl:w-34'
        }
        aria-hidden="true"
      />

      <p className="mt-5 text-[13px] font-medium text-[#899086] xl:text-[18px]">
        분석이 완료되었어요.
      </p>
      <p className="text-[13px] font-medium text-[#899086] xl:text-[18px]">
        AI가 당신의 답변을 바탕으로 다음과 같이 분석했어요.
      </p>
      <h2 className="mt-3 text-[22px] font-bold text-black xl:text-[34px]">
        {verdict.title}
      </h2>
      <p className="mt-3 text-[14px] leading-5.5 text-[#666] xl:text-[18px] xl:leading-7">
        {verdict.description}
      </p>

      <div className="mt-8 flex w-full flex-col gap-4 xl:mt-10">
        {SCORE_ROWS.map(({ key, label }) => (
          <ScoreRow key={key} label={label} score={verdict.scores[key]} />
        ))}
      </div>

      <div className="mt-10 flex w-full flex-col gap-3 xl:mt-14">
        <button
          type="button"
          onClick={onStartTimer}
          disabled={isSubmitting}
          className="flex h-12.5 w-full items-center justify-center gap-2 rounded-[5px] bg-[#3e9b48] text-[16px] font-semibold text-white xl:h-16 xl:text-[24px]"
        >
          {isSubmitting && <Spinner className="h-4 w-4 border-white" />}
          24시간 고민 시작하기
        </button>
        <button
          type="button"
          onClick={onGoHome}
          disabled={isSubmitting}
          className="h-12.5 w-full rounded-[5px] border border-[#a9a9a9] bg-white text-[16px] font-semibold text-[#666] xl:h-16 xl:text-[24px]"
        >
          홈으로 돌아가기
        </button>
      </div>
    </div>
  );
}
