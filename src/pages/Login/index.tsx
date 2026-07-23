import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../routes/paths';

// 피그마 디자인 없음 — 이메일/비밀번호 입력만 있는 임시 UI (사용자 확인 완료)
export function LoginPage() {
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSignIn = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const { error: signInError } = await signIn(email, password);
    setIsSubmitting(false);

    if (signInError) {
      setError(signInError);
      return;
    }
    navigate(ROUTES.home, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#eefff0] px-4">
      <form
        onSubmit={handleSignIn}
        className="flex w-full max-w-sm flex-col gap-4 rounded-2xl border border-[rgba(188,230,193,0.55)] bg-white p-8 shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)]"
      >
        <h1 className="text-center text-xl font-semibold text-black">
          로그인
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
            autoComplete="current-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="6자 이상 입력해주세요"
            className="rounded-lg border border-[rgba(188,230,193,0.55)] px-3 py-2 text-sm text-black outline-none focus:border-black"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-black py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          로그인
        </button>

        <p className="text-center text-sm text-[#666]">
          계정이 없으신가요?{' '}
          <Link to={ROUTES.signup} className="font-semibold text-black">
            회원가입
          </Link>
        </p>
      </form>
    </div>
  );
}

export default LoginPage;
