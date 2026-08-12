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
    <>
      {/* 이슈 #39: 모바일 레이아웃(피그마 App 가입완료·목표설정 182:475)만 남기고 데스크톱
          레이아웃은 삭제했다. min-h-screen(브라우저 뷰포트 기준) → h-full(PhoneFrame 스크린
          영역 기준)로 전환. */}
      <div className="flex h-full flex-col items-center bg-[#f4faef] px-6 pt-25 font-noto">
        <div className="flex w-full flex-col items-center gap-7">
          <div className="flex h-22 w-22 items-center justify-center rounded-[44px] bg-[#e9f6e4] text-[40px]">
            🎉
          </div>

          <div className="text-center">
            <h1 className="text-[24px] font-bold text-[#1f2420]">
              가입이 완료되었어요!
            </h1>
            <p className="mt-2 text-[13px] leading-5 text-[#899086]">
              이번 달 절약 목표를 설정하면
              <br />
              대시보드에서 달성률을 한 눈에 볼 수 있어요.
            </p>
          </div>

          <div className="w-full rounded-2xl bg-white p-5">
            <label
              htmlFor="mobile-goal-amount"
              className="mb-2.5 block text-[13px] font-medium text-[#1f2420]"
            >
              월 절약 목표 금액
            </label>
            <div className="flex h-14 items-center justify-between rounded-xl border border-[#4fb75b] bg-[#fafbf8] px-4.25">
              <input
                id="mobile-goal-amount"
                inputMode="numeric"
                value={goalAmount === 0 ? '' : formatWon(goalAmount)}
                onChange={(event) => handleAmountChange(event.target.value)}
                placeholder="100,000"
                className="w-full bg-transparent text-[18px] font-bold text-[#1f2420] outline-none placeholder:text-[#adb3a9]"
              />
              <span className="ml-2 shrink-0 text-[14px] font-medium text-[#899086]">
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
                  className={`rounded-full border px-3 py-2 text-[12px] font-medium transition-colors ${
                    selectedChip === chip.value
                      ? 'border-[#4fb75b] bg-[#e9f6e4] text-[#3e9b48]'
                      : 'border-[#e7eae4] bg-white text-[#899086]'
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>

          <div className="w-full">
            <SubmitButton
              active={goalAmount > 0 && goalError === null}
              isSubmitting={isSubmitting}
              type="button"
              onClick={handleStart}
              heightClassName="h-12"
            >
              멈칫 시작하기
            </SubmitButton>
          </div>

          <button
            type="button"
            onClick={handleSkip}
            className="text-[13px] font-medium text-[#899086]"
          >
            나중에 설정할래요
          </button>
        </div>
      </div>
    </>
  );
}

export default SignupCompletePage;
