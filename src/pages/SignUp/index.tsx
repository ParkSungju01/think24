import { useState, type FormEvent, type ReactNode } from 'react';
import { Check, Info } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthField } from '../../components/auth/AuthField';
import { BrandPanel } from '../../components/auth/BrandPanel';
import { SubmitButton } from '../../components/auth/SubmitButton';
import { useAuth } from '../../contexts/AuthContext';
import { createProfile } from '../../lib/profiles';
import { markSignupJustCompleted } from '../../lib/signupFlag';
import { ROUTES } from '../../routes/paths';
import {
  getPasswordError,
  isPasswordStrongEnough,
} from '../../utils/passwordValidation';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;
// 금칙어 필터는 mock 수준의 예시 목록이다 (욕설/운영자 사칭 등, 명세 2-1)
const BANNED_NICKNAME_WORDS = [
  '관리자',
  '운영자',
  'admin',
  'administrator',
  '시발',
  '씨발',
  '병신',
  '좆같',
  '존나',
];

export function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  // 2-1 닉네임
  const [nickname, setNickname] = useState('');

  // 2-2 이메일 (중복 여부는 최종 제출 시 signUp 호출로만 판별, AuthContext 참고)
  const [email, setEmail] = useState('');
  const [emailFormatError, setEmailFormatError] = useState<string | null>(
    null,
  );

  // 2-4 비밀번호 / 비밀번호 확인
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');

  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleEmailBlur = () => {
    if (email.length === 0) {
      setEmailFormatError(null);
      return;
    }
    setEmailFormatError(
      EMAIL_REGEX.test(email) ? null : '이메일 형식이 올바르지 않습니다.',
    );
  };

  const nicknameError = (() => {
    if (nickname.length === 0) return null;
    if (!NICKNAME_REGEX.test(nickname)) {
      return '2~10자의 한글/영문/숫자만 사용할 수 있습니다.';
    }
    const lower = nickname.toLowerCase();
    if (
      BANNED_NICKNAME_WORDS.some((word) => lower.includes(word.toLowerCase()))
    ) {
      return '사용할 수 없는 닉네임입니다.';
    }
    return null;
  })();

  const passwordError = getPasswordError(password, email);
  const confirmMismatch =
    passwordConfirm.length > 0 && passwordConfirm !== password;

  const isNicknameValid = nickname.length > 0 && nicknameError === null;
  const isPasswordValid = passwordError === null && isPasswordStrongEnough(password);
  const isConfirmValid = passwordConfirm.length > 0 && !confirmMismatch;

  const isEmailValid = EMAIL_REGEX.test(email);

  const isFormValid =
    isNicknameValid && isEmailValid && isPasswordValid && isConfirmValid;

  const emailMessage: ReactNode = emailFormatError ?? undefined;
  const emailMessageTone = 'error';

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isFormValid) return;

    setSubmitError(null);
    setIsSubmitting(true);

    const {
      error: signUpError,
      needsEmailConfirmation,
      userId,
    } = await signUp(email, password);

    if (signUpError) {
      setIsSubmitting(false);
      setSubmitError(signUpError);
      return;
    }

    if (needsEmailConfirmation || !userId) {
      setIsSubmitting(false);
      setSubmitError(
        '이메일 확인이 필요해 가입을 완료할 수 없습니다. Supabase 프로젝트의 Authentication 설정에서 "Confirm email"을 꺼주세요.',
      );
      return;
    }

    const { error: profileError } = await createProfile(userId, nickname);
    setIsSubmitting(false);

    if (profileError) {
      setSubmitError(
        `회원가입은 완료됐지만 프로필 저장에 실패했습니다: ${profileError}`,
      );
      return;
    }

    markSignupJustCompleted();
    navigate(ROUTES.signupComplete, { replace: true });
  };

  return (
    <div className="flex min-h-screen">
      <BrandPanel />
      <div className="flex flex-1 items-center justify-center px-4 py-12 font-noto sm:px-6">
        <form
          onSubmit={handleSubmit}
          noValidate
          className="flex w-full max-w-110 flex-col gap-7"
        >
          <div>
            <h1 className="text-[26px] font-bold text-[#1f2420]">회원가입</h1>
            <p className="mt-2.5 text-[14px] text-[#899086]">
              1분이면 충분해요. 멈칫과 함께 절약을 시작해 보세요.
            </p>
          </div>

          <div className="flex flex-col gap-5">
            <AuthField
              id="nickname"
              label="닉네임"
              required
              placeholder="2~10자, 한글/영문/숫자"
              value={nickname}
              onChange={setNickname}
              maxLength={10}
              message={nicknameError ?? undefined}
              messageTone="error"
            />

            <AuthField
              id="email"
              label="이메일"
              required
              type="email"
              autoComplete="email"
              placeholder="example@meomchit.com"
              value={email}
              onChange={setEmail}
              onBlur={handleEmailBlur}
              message={emailMessage}
              messageTone={emailMessageTone}
            />

            <AuthField
              id="password"
              label="비밀번호"
              required
              type="password"
              autoComplete="new-password"
              placeholder="8~20자, 영문/숫자/특수문자 조합"
              value={password}
              onChange={(value) => setPassword(value.replace(/\s/g, ''))}
              message={
                passwordError ?? (
                  <>
                    <Info className="h-3 w-3" /> 영문 대소문자, 숫자,
                    특수문자를 포함해 8자 이상 입력해 주세요.
                  </>
                )
              }
              messageTone={passwordError ? 'error' : 'hint'}
            />

            <AuthField
              id="password-confirm"
              label="비밀번호 확인"
              required
              type="password"
              autoComplete="new-password"
              placeholder="비밀번호를 한 번 더 입력해 주세요"
              value={passwordConfirm}
              onChange={(value) => setPasswordConfirm(value.replace(/\s/g, ''))}
              message={
                confirmMismatch ? (
                  '비밀번호가 일치하지 않습니다.'
                ) : passwordConfirm.length > 0 ? (
                  <>
                    <Check className="h-3 w-3" strokeWidth={3} /> 비밀번호가
                    일치합니다.
                  </>
                ) : undefined
              }
              messageTone={confirmMismatch ? 'error' : 'success'}
            />
          </div>

          <div>
            <SubmitButton active={isFormValid} isSubmitting={isSubmitting}>
              가입하기
            </SubmitButton>
            {submitError && (
              <p className="mt-3 text-center text-[13px] text-[#e05b4e]">
                {submitError}
              </p>
            )}
          </div>

          <p className="text-center text-[14px] text-[#899086]">
            이미 계정이 있으신가요?{' '}
            <Link to={ROUTES.login} className="font-bold text-[#3e9b48]">
              로그인
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default SignUpPage;
