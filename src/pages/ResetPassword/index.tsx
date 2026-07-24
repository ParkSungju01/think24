import { useEffect, useState, type FormEvent } from 'react';
import { Check } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthField } from '../../components/auth/AuthField';
import { BrandPanel } from '../../components/auth/BrandPanel';
import { SubmitButton } from '../../components/auth/SubmitButton';
import { supabase } from '../../lib/supabase';
import { ROUTES } from '../../routes/paths';
import { getPasswordError, isPasswordStrongEnough } from '../../utils/passwordValidation';

type Mode = 'request' | 'sent' | 'update' | 'done';

// 피그마 디자인 없음(사용자 확인 완료) — 로그인/회원가입 폼과 동일한 톤(BrandPanel + 공용 입력 필드)으로 신규 구현.
// 1) 이메일 입력 → resetPasswordForEmail 발송(명세 1-5) 2) 재설정 링크로 돌아왔을 때 새 비밀번호 입력(recovery 세션)
export function ResetPasswordPage() {
  const navigate = useNavigate();
  // 재설정 링크를 타고 돌아온 첫 진입이면 Supabase가 URL 해시에 type=recovery를 실어준다.
  // lazy initializer로 초기 모드 자체를 판별해 마운트 effect에서의 직접 setState를 피한다.
  const [mode, setMode] = useState<Mode>(() =>
    window.location.hash.includes('type=recovery') ? 'update' : 'request',
  );

  const [email, setEmail] = useState('');
  const [isSendingLink, setIsSendingLink] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // 위 초기 진입 판별 이후에도, 이미 이 페이지가 열려 있는 상태로 Supabase 세션이 recovery로
  // 전환되는 경우(드묾)를 대비해 구독은 유지한다 — 콜백 안의 setState라 lint 규칙에 안전하다
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMode('update');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const handleSendLink = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSendingLink(true);
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}${ROUTES.resetPassword}`,
    });
    setIsSendingLink(false);
    // 1-5: 발송 성공/실패 여부와 무관하게 동일한 안내를 보여줘 계정 탐색을 방지한다
    setMode('sent');
  };

  const passwordError = getPasswordError(newPassword);
  const confirmMismatch =
    confirmPassword.length > 0 && confirmPassword !== newPassword;
  const isUpdateFormValid =
    isPasswordStrongEnough(newPassword) &&
    confirmPassword === newPassword &&
    passwordError === null;

  const handleUpdatePassword = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUpdateError(null);
    setIsUpdating(true);
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    setIsUpdating(false);

    if (error) {
      setUpdateError(error.message);
      return;
    }
    setMode('done');
  };

  return (
    <div className="flex min-h-screen">
      <BrandPanel />
      <div className="flex flex-1 items-center justify-center px-4 py-12 font-noto sm:px-6">
        <div className="flex w-full max-w-100 flex-col gap-8.5">
          {mode === 'request' && (
            <form onSubmit={handleSendLink} noValidate className="flex flex-col gap-8.5">
              <div>
                <h1 className="text-[26px] font-bold text-[#1f2420]">
                  비밀번호 재설정
                </h1>
                <p className="mt-2.5 text-[14px] text-[#899086]">
                  가입하신 이메일로 재설정 링크를 보내드려요. (유효시간 30분)
                </p>
              </div>
              <AuthField
                id="reset-email"
                label="이메일"
                type="email"
                autoComplete="email"
                placeholder="example@meomchit.com"
                value={email}
                onChange={setEmail}
              />
              <SubmitButton active={email.length > 0} isSubmitting={isSendingLink}>
                재설정 링크 보내기
              </SubmitButton>
              <p className="text-center text-[14px] text-[#899086]">
                <Link to={ROUTES.login} className="font-bold text-[#3e9b48]">
                  로그인으로 돌아가기
                </Link>
              </p>
            </form>
          )}

          {mode === 'sent' && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e9f6e4]">
                <Check className="h-8 w-8 text-[#3e9b48]" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-[26px] font-bold text-[#1f2420]">
                  메일이 발송되었습니다
                </h1>
                <p className="mt-2.5 text-[14px] text-[#899086]">
                  입력하신 이메일로 비밀번호 재설정 링크를 보내드렸어요.
                  <br />
                  메일함(스팸함 포함)을 확인해 주세요.
                </p>
              </div>
              <Link
                to={ROUTES.login}
                className="text-[14px] font-bold text-[#3e9b48]"
              >
                로그인으로 돌아가기
              </Link>
            </div>
          )}

          {mode === 'update' && (
            <form
              onSubmit={handleUpdatePassword}
              noValidate
              className="flex flex-col gap-8.5"
            >
              <div>
                <h1 className="text-[26px] font-bold text-[#1f2420]">
                  새 비밀번호 설정
                </h1>
                <p className="mt-2.5 text-[14px] text-[#899086]">
                  새로 사용하실 비밀번호를 입력해 주세요.
                </p>
              </div>
              <div className="flex flex-col gap-5">
                <AuthField
                  id="new-password"
                  label="새 비밀번호"
                  type="password"
                  autoComplete="new-password"
                  placeholder="8~20자, 영문/숫자/특수문자 조합"
                  value={newPassword}
                  onChange={(value) => setNewPassword(value.replace(/\s/g, ''))}
                  message={
                    passwordError ??
                    'ⓘ 영문 대소문자, 숫자, 특수문자를 포함해 8자 이상 입력해 주세요.'
                  }
                  messageTone={passwordError ? 'error' : 'hint'}
                />
                <AuthField
                  id="confirm-password"
                  label="새 비밀번호 확인"
                  type="password"
                  autoComplete="new-password"
                  placeholder="비밀번호를 한 번 더 입력해 주세요"
                  value={confirmPassword}
                  onChange={(value) =>
                    setConfirmPassword(value.replace(/\s/g, ''))
                  }
                  message={
                    confirmMismatch
                      ? '비밀번호가 일치하지 않습니다.'
                      : confirmPassword.length > 0
                        ? '✓ 비밀번호가 일치합니다.'
                        : undefined
                  }
                  messageTone={confirmMismatch ? 'error' : 'success'}
                />
              </div>
              {updateError && (
                <p className="text-center text-[13px] text-[#e05b4e]">
                  {updateError}
                </p>
              )}
              <SubmitButton active={isUpdateFormValid} isSubmitting={isUpdating}>
                비밀번호 변경하기
              </SubmitButton>
            </form>
          )}

          {mode === 'done' && (
            <div className="flex flex-col items-center gap-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#e9f6e4]">
                <Check className="h-8 w-8 text-[#3e9b48]" strokeWidth={2.5} />
              </div>
              <div>
                <h1 className="text-[26px] font-bold text-[#1f2420]">
                  비밀번호가 변경되었어요
                </h1>
                <p className="mt-2.5 text-[14px] text-[#899086]">
                  새 비밀번호로 다시 로그인해 주세요.
                </p>
              </div>
              <SubmitButton
                active
                type="button"
                onClick={() => navigate(ROUTES.login, { replace: true })}
              >
                로그인하러 가기
              </SubmitButton>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;
