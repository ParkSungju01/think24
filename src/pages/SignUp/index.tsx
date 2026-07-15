import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../routes/paths';

// 피그마 디자인 없음 — 로그인 화면과 동일한 톤의 임시 UI (사용자 확인 완료)
// 진짜 type="submit" 버튼 + <form onSubmit>을 사용해 HTML5 required/minLength
// 유효성 검사가 브라우저에서 자연스럽게 걸리도록 한다
// (Login 페이지에서 type="button"으로 handleSignUp을 onClick 호출했을 때
// 빈 값이 그대로 넘어가 "Anonymous sign-ins are disabled" 에러가 났던 것과
// 같은 실수를 반복하지 않기 위함).
export function SignUpPage() {
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignUp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setNotice(null);
    setIsSubmitting(true);

    const { error: signUpError, needsEmailConfirmation } = await signUp(
      email,
      password,
    );
    setIsSubmitting(false);

    if (signUpError) {
      setError(signUpError);
      return;
    }
    if (needsEmailConfirmation) {
      setNotice('가입 확인 이메일을 보냈어요. 메일함을 확인해주세요.');
      return;
    }
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eefff0] px-4">
      <form
        onSubmit={handleSignUp}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-[rgba(188,230,193,0.55)] bg-white p-8 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)]"
      >
        <h1 className="text-center text-xl font-semibold text-black">
          회원가입
        </h1>

        <div className="flex flex-col gap-1">
          <label htmlFor="email" className="text-sm font-medium text-[#666]">
            이메일
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="rounded-lg border border-[rgba(188,230,193,0.55)] px-3 py-2 text-sm text-black outline-none focus:border-black"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label
            htmlFor="password"
            className="text-sm font-medium text-[#666]"
          >
            비밀번호
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="6자 이상 입력해주세요"
            className="rounded-lg border border-[rgba(188,230,193,0.55)] px-3 py-2 text-sm text-black outline-none focus:border-black"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {notice && <p className="text-sm text-[#2b8a3e]">{notice}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          회원가입
        </button>

        <p className="text-center text-sm text-[#666]">
          이미 계정이 있으신가요?{' '}
          <Link to={ROUTES.login} className="font-semibold text-black">
            로그인
          </Link>
        </p>
      </form>
    </div>
  );
}

export default SignUpPage;
