import { useRef, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { upsertGoal } from '../../lib/goals';
import {
  clearSignupJustCompletedFlag,
  hasJustSignedUpFlag,
} from '../../lib/signupFlag';
import { ROUTES } from '../../routes/paths';
import { SubmitButton } from '../../components/auth/SubmitButton';
import { formatWon, parseWon } from '../../utils/format';

const MIN_GOAL_AMOUNT = 10_000;
const MAX_GOAL_AMOUNT = 10_000_000;
const DEFAULT_GOAL_AMOUNT = 100_000;

const CHIP_OPTIONS = [
  { label: '5만원', value: 50_000 as const },
  { label: '10만원', value: 100_000 as const },
  { label: '20만원', value: 200_000 as const },
];

type ChipValue = 50_000 | 100_000 | 200_000 | 'custom';

// 신규 화면 (피그마 182:327). 회원가입 성공 직후에만 자연스러운 화면이라 sessionStorage
// 플래그로 접근을 제어한다 (직접 URL 접근 시 홈으로 리다이렉트 — 사용자 확인 완료).
export function SignupCompletePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const amountInputRef = useRef<HTMLInputElement>(null);

  const [goalAmount, setGoalAmount] = useState(DEFAULT_GOAL_AMOUNT);
  const [selectedChip, setSelectedChip] = useState<ChipValue>(
    DEFAULT_GOAL_AMOUNT,
  );
  const [goalError, setGoalError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!hasJustSignedUpFlag() || !user) {
    return <Navigate to={ROUTES.home} replace />;
  }

  const validateAmount = (amount: number): string | null => {
    if (amount < MIN_GOAL_AMOUNT || amount > MAX_GOAL_AMOUNT) {
      return `1만원~1,000만원 사이로 입력해 주세요.`;
    }
    return null;
  };

  const handleAmountChange = (raw: string) => {
    const amount = parseWon(raw);
    setGoalAmount(amount);
    const matchedChip = CHIP_OPTIONS.find((chip) => chip.value === amount);
    setSelectedChip(matchedChip ? matchedChip.value : 'custom');
    setGoalError(amount === 0 ? null : validateAmount(amount));
  };

  const handleChipClick = (value: ChipValue) => {
    if (value === 'custom') {
      setSelectedChip('custom');
      amountInputRef.current?.focus();
      return;
    }
    setSelectedChip(value);
    setGoalAmount(value);
    setGoalError(null);
  };

  const handleStart = async () => {
    const error = validateAmount(goalAmount);
    if (error) {
      setGoalError(error);
      return;
    }
    setIsSubmitting(true);
    const { error: saveError } = await upsertGoal(user.id, goalAmount);
    setIsSubmitting(false);

    if (saveError) {
      setGoalError(`목표 저장에 실패했습니다: ${saveError}`);
      return;
    }
    clearSignupJustCompletedFlag();
    navigate(ROUTES.home, { replace: true });
  };

  const handleSkip = () => {
    clearSignupJustCompletedFlag();
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f4faef] px-4 py-12 font-noto">
      <div className="flex w-full max-w-130 flex-col items-center gap-7 rounded-3xl bg-white p-12 shadow-[0px_8px_32px_0px_rgba(31,51,31,0.08)]">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e9f6e4] text-[36px]">
          🎉
        </div>

        <div className="text-center">
          <h1 className="text-[26px] font-bold text-[#1f2420]">
            가입이 완료되었어요!
          </h1>
          <p className="mt-2 text-[14px] leading-[22px] text-[#899086]">
            이번 달 절약 목표를 설정하면
            <br />
            대시보드에서 달성률을 한 눈에 볼 수 있어요.
          </p>
        </div>

        <div className="w-full">
          <label
            htmlFor="goal-amount"
            className="mb-2.5 block text-[14px] font-medium text-[#1f2420]"
          >
            월 절약 목표 금액
          </label>
          <div className="flex h-14 items-center justify-between rounded-xl border border-[#4fb75b] bg-[#fafbf8] px-4.25">
            <input
              id="goal-amount"
              ref={amountInputRef}
              inputMode="numeric"
              value={goalAmount === 0 ? '' : formatWon(goalAmount)}
              onChange={(event) => handleAmountChange(event.target.value)}
              placeholder="100,000"
              className="w-full bg-transparent text-[20px] font-bold text-[#1f2420] outline-none placeholder:text-[#adb3a9]"
            />
            <span className="ml-2 shrink-0 text-[16px] font-medium text-[#899086]">
              원
            </span>
          </div>
          {goalError && (
            <p className="mt-2 text-[12px] text-[#e05b4e]">{goalError}</p>
          )}
          <div className="mt-2.5 flex flex-wrap gap-2">
            {CHIP_OPTIONS.map((chip) => (
              <button
                key={chip.value}
                type="button"
                onClick={() => handleChipClick(chip.value)}
                className={`h-8 rounded-full border px-5 text-[13px] font-medium transition-colors ${
                  selectedChip === chip.value
                    ? 'border-[#4fb75b] bg-[#e9f6e4] text-[#3e9b48]'
                    : 'border-[#e7eae4] bg-white text-[#899086]'
                }`}
              >
                {chip.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => handleChipClick('custom')}
              className={`h-8 rounded-full border px-5 text-[13px] font-medium transition-colors ${
                selectedChip === 'custom'
                  ? 'border-[#4fb75b] bg-[#e9f6e4] text-[#3e9b48]'
                  : 'border-[#e7eae4] bg-white text-[#899086]'
              }`}
            >
              직접 입력
            </button>
          </div>
        </div>

        <div className="w-full">
          <SubmitButton
            active={goalAmount > 0 && goalError === null}
            isSubmitting={isSubmitting}
            type="button"
            onClick={handleStart}
          >
            멈칫 시작하기
          </SubmitButton>
        </div>

        <button
          type="button"
          onClick={handleSkip}
          className="text-[14px] font-medium text-[#899086]"
        >
          나중에 설정할래요
        </button>
      </div>
    </div>
  );
}

export default SignupCompletePage;
