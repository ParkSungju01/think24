import { useState, type FormEvent, type ReactNode } from 'react';
import { Check, ChevronLeft, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthField } from '../../components/auth/AuthField';
import { SubmitButton } from '../../components/auth/SubmitButton';
import { useAuth } from '../../contexts/AuthContext';
import { createProfile } from '../../lib/profiles';
import { markSignupJustCompleted } from '../../lib/signupFlag';
import { ROUTES } from '../../routes/paths';
import { getNicknameError } from '../../utils/nicknameValidation';
import {
  getPasswordError,
  isPasswordStrongEnough,
} from '../../utils/passwordValidation';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

  const nicknameError = getNicknameError(nickname);

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
    <>
      {/* 이슈 #39: 모바일 레이아웃(피그마 App 회원가입 182:395)만 남기고 데스크톱 레이아웃
          (BrandPanel 포함)은 삭제했다 — 폰 프레임 안에서는 항상 모바일 폭이라 데스크톱 분기가
          렌더링될 일이 없다. */}
      <div className="flex flex-col px-6 font-noto">
        <header className="flex items-center gap-3 pt-14">
          <button
            type="button"
            aria-label="뒤로가기"
            onClick={() => navigate(ROUTES.login)}
            className="flex h-8 w-8 items-center justify-center text-[#1f2420]"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-[18px] font-bold text-[#1f2420]">회원가입</h1>
        </header>

        <form
          onSubmit={handleSubmit}
          noValidate
          className="mt-5 flex flex-col gap-5"
        >
          <AuthField
            id="mobile-nickname"
            label="닉네임"
            required
            placeholder="2~10자, 한글/영문/숫자"
            value={nickname}
            onChange={setNickname}
            maxLength={10}
            inputHeightClassName="h-10.75"
            labelClassName="text-[13px]"
            messageClassName="text-[11px]"
            message={nicknameError ?? undefined}
            messageTone="error"
          />

          <AuthField
            id="mobile-email"
            label="이메일"
            required
            type="email"
            autoComplete="email"
            placeholder="example@meomchit.com"
            value={email}
            onChange={setEmail}
            onBlur={handleEmailBlur}
            inputHeightClassName="h-10.75"
            labelClassName="text-[13px]"
            messageClassName="text-[11px]"
            message={emailMessage}
            messageTone={emailMessageTone}
          />

          <AuthField
            id="mobile-password"
            label="비밀번호"
            required
            type="password"
            autoComplete="new-password"
            placeholder="8~20자, 영문/숫자/특수문자 조합"
            value={password}
            onChange={(value) => setPassword(value.replace(/\s/g, ''))}
            inputHeightClassName="h-10.75"
            labelClassName="text-[13px]"
            messageClassName="text-[11px]"
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
            id="mobile-password-confirm"
            label="비밀번호 확인"
            required
            type="password"
            autoComplete="new-password"
            placeholder="비밀번호를 한 번 더 입력해 주세요"
            value={passwordConfirm}
            onChange={(value) => setPasswordConfirm(value.replace(/\s/g, ''))}
            inputHeightClassName="h-10.75"
            labelClassName="text-[13px]"
            messageClassName="text-[11px]"
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

          <div>
            <SubmitButton
              active={isFormValid}
              isSubmitting={isSubmitting}
              heightClassName="h-12"
            >
              가입하기
            </SubmitButton>
            {submitError && (
              <p className="mt-3 text-center text-[13px] text-[#e05b4e]">
                {submitError}
              </p>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

export default SignUpPage;
