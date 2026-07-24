import { useState, type FormEvent } from 'react';
import { Check, Eye, EyeOff } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthField } from '../../components/auth/AuthField';
import { BrandPanel } from '../../components/auth/BrandPanel';
import { SubmitButton } from '../../components/auth/SubmitButton';
import { useAuth } from '../../contexts/AuthContext';
import { useCountdown } from '../../hooks/useCountdown';
import { ROUTES } from '../../routes/paths';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const LOCK_DURATION_MS = 10 * 60 * 1000;
const MAX_FAILED_ATTEMPTS = 5;
// Supabase에 로그인 실패 횟수 카운터가 없어 mock 처리 (사용자 확인 완료) — 브라우저 세션(state) 기준
const REMEMBERED_EMAIL_KEY = 'meomchit:rememberedEmail';

export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  // 1-1: 자동 로그인 설정이 되어 있으면(=이전에 "로그인 상태 유지" 체크 후 로그인) 최근 이메일
  // 자동완성 — 마운트 effect 대신 lazy initializer로 초기값 자체를 localStorage에서 읽어온다
  // (React 18 StrictMode에서 effect가 2번 실행되는 것과 무관하게 항상 안전하고,
  // 첫 렌더부터 값이 채워져 있어 "빈 값 → 자동완성" 플래시도 없다)
  const [email, setEmail] = useState(
    () => window.localStorage.getItem(REMEMBERED_EMAIL_KEY) ?? '',
  );
  const [emailError, setEmailError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [keepLoggedIn, setKeepLoggedIn] = useState(
    () => window.localStorage.getItem(REMEMBERED_EMAIL_KEY) !== null,
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [failedAttemptCount, setFailedAttemptCount] = useState(0);
  const [lockedUntil, setLockedUntil] = useState<number | null>(null);

  const lockRemainingSeconds = useCountdown(lockedUntil);
  const isLocked = lockedUntil !== null && lockRemainingSeconds > 0;
  // 잠금 타이머가 끝나면(effect 없이, 렌더링 시점에 파생값으로) 잠금 안내 문구를 감춘다
  const displayedSubmitError =
    lockedUntil !== null && !isLocked ? null : submitError;

  const handleEmailBlur = () => {
    if (email.length === 0) {
      setEmailError(null);
      return;
    }
    setEmailError(
      EMAIL_REGEX.test(email) ? null : '이메일 형식이 올바르지 않습니다.',
    );
  };

  const handlePasswordChange = (value: string) => {
    // 1-2: 공백 문자 입력 차단 (붙여넣기는 허용, 붙여넣은 텍스트에서 공백만 제거)
    setPassword(value.replace(/\s/g, ''));
  };

  const isFormValid =
    emailError === null && email.length > 0 && password.length > 0;

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLocked) return;

    setSubmitError(null);
    setIsSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setIsSubmitting(false);

    if (signInError) {
      const nextCount = failedAttemptCount + 1;
      if (nextCount >= MAX_FAILED_ATTEMPTS) {
        setFailedAttemptCount(0);
        setLockedUntil(Date.now() + LOCK_DURATION_MS);
        setSubmitError('5회 이상 실패하여 10분간 로그인이 제한됩니다.');
      } else {
        setFailedAttemptCount(nextCount);
        // 1-3: 이메일/비밀번호 중 무엇이 틀렸는지 구분하지 않는다(계정 존재 여부 노출 금지)
        setSubmitError('이메일 또는 비밀번호가 일치하지 않습니다.');
      }
      return;
    }

    setFailedAttemptCount(0);
    // 1-4: "로그인 상태 유지"는 Supabase에 커스텀 httpOnly 리프레시 토큰 저장 기능이 없어 mock 처리
    // (세션 유지 자체는 supabase-js 기본 옵션으로 항상 동작 — docs/plans/backend-setup.md 확정 사항).
    // 체크 시 다음 방문 때 이메일 자동완성만 재현한다.
    if (keepLoggedIn) {
      window.localStorage.setItem(REMEMBERED_EMAIL_KEY, email);
    } else {
      window.localStorage.removeItem(REMEMBERED_EMAIL_KEY);
    }
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <BrandPanel />
      <div className="flex flex-1 items-center justify-center px-4 py-12 font-noto sm:px-6">
        <form
          onSubmit={handleSignIn}
          noValidate
          className="flex w-full max-w-100 flex-col gap-8.5"
        >
          <div>
            <h1 className="text-[26px] font-bold text-[#1f2420]">로그인</h1>
            <p className="mt-2.5 text-[14px] text-[#899086]">
              다시 만나서 반가워요. 오늘도 현명한 소비 하세요!
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <AuthField
              id="email"
              label="이메일"
              type="email"
              autoComplete="email"
              placeholder="example@meomchit.com"
              value={email}
              onChange={setEmail}
              onBlur={handleEmailBlur}
              inputHeightClassName="h-11.5"
              message={emailError}
              messageTone="error"
            />
            <AuthField
              id="password"
              label="비밀번호"
              type={passwordVisible ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="비밀번호를 입력해 주세요"
              value={password}
              onChange={handlePasswordChange}
              inputHeightClassName="h-11.5"
              rightSlot={
                <button
                  type="button"
                  onClick={() => setPasswordVisible((visible) => !visible)}
                  className="text-[#899086]"
                  aria-label={
                    passwordVisible ? '비밀번호 숨기기' : '비밀번호 표시'
                  }
                >
                  {passwordVisible ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setKeepLoggedIn((value) => !value)}
                aria-pressed={keepLoggedIn}
                className={`flex h-5 w-5 items-center justify-center rounded-md border transition-colors ${
                  keepLoggedIn
                    ? 'border-[#4fb75b] bg-[#4fb75b]'
                    : 'border-[#e7eae4] bg-white'
                }`}
              >
                {keepLoggedIn && (
                  <Check className="h-3 w-3 text-white" strokeWidth={3} />
                )}
              </button>
              <span
                className="text-[14px] text-[#1f2420]"
                title="공용 PC에서는 로그인 상태 유지 사용에 주의해 주세요."
              >
                로그인 상태 유지
              </span>
            </div>
          </div>

          <div>
            <SubmitButton
              active={isFormValid && !isLocked}
              isSubmitting={isSubmitting}
            >
              로그인
            </SubmitButton>
            {displayedSubmitError && (
              <p className="mt-3 text-center text-[13px] text-[#e05b4e]">
                {displayedSubmitError}
              </p>
            )}
          </div>

          <p className="text-center text-[14px] text-[#899086]">
            아직 회원이 아니신가요?{' '}
            <Link to={ROUTES.signup} className="font-bold text-[#3e9b48]">
              회원가입
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default LoginPage;
