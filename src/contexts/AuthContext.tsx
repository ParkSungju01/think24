import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import {
  fetchNickname,
  updateNickname as updateNicknameRequest,
} from '../lib/profiles';

interface AuthActionResult {
  error: string | null;
  /** 회원가입 직후 이메일 확인이 필요해 세션이 아직 없는 경우 true */
  needsEmailConfirmation?: boolean;
  /** 회원가입 성공 시 생성된 사용자 id. profiles 테이블 insert 등 후속 처리에 사용 */
  userId?: string;
}

interface AuthContextValue {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  /** profiles 테이블에 저장된 닉네임 (없으면 null — 호출부에서 이메일 prefix 등으로 폴백) */
  nickname: string | null;
  /** 닉네임 조회가 아직 끝나지 않은 동안 true. 로그인 직후 잠깐 존재 */
  isNicknameLoading: boolean;
  signUp: (email: string, password: string) => Promise<AuthActionResult>;
  signIn: (email: string, password: string) => Promise<AuthActionResult>;
  signOut: () => Promise<void>;
  /** 마이페이지에서 닉네임 저장 시 호출. 성공하면 전역 nickname 상태도 즉시 갱신해
   * 홈 화면 등 닉네임을 표시하는 다른 화면에 바로 반영되게 한다 (docs/plans/mypage.md 확인 완료 11). */
  updateNickname: (nickname: string) => Promise<{ error: string | null }>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [nickname, setNickname] = useState<string | null>(null);
  const [isNicknameLoading, setIsNicknameLoading] = useState(true);

  // 최상위에서 한 번만 세션 상태를 구독해 여러 화면(홈 등)에 user_id를 전파한다
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 세션의 유저가 바뀔 때마다(로그인/로그아웃) 닉네임을 다시 조회한다. 여러 화면(홈/마이페이지)이
  // 각자 fetchNickname을 부르는 대신 여기서 한 번만 조회해 전역으로 공유한다.
  useEffect(() => {
    const userId = session?.user?.id;
    let cancelled = false;

    (async () => {
      if (!userId) {
        setNickname(null);
        setIsNicknameLoading(false);
        return;
      }

      setIsNicknameLoading(true);
      const result = await fetchNickname(userId);
      if (cancelled) return;
      setNickname(result);
      setIsNicknameLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [session?.user?.id]);

  const signUp: AuthContextValue['signUp'] = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      return { error: error.message };
    }
    // Supabase는 이메일 열거 공격 방지를 위해 이미 가입된 이메일로 signUp을 다시
    // 호출해도 에러를 주지 않고 "성공한 것처럼" 응답한다. 이 경우 data.user는 있지만
    // data.user.identities가 빈 배열([])로 온다 — 신규 가입과 구분하는 유일한 신호.
    if (data.user && data.user.identities?.length === 0) {
      return { error: '이미 가입된 이메일입니다.' };
    }
    // 이메일 확인이 켜져 있으면 signUp 직후 session이 null로 온다
    return {
      error: null,
      needsEmailConfirmation: !data.session,
      userId: data.user?.id,
    };
  };

  const signIn: AuthContextValue['signIn'] = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error: error?.message ?? null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const updateNickname: AuthContextValue['updateNickname'] = async (
    nextNickname,
  ) => {
    const userId = session?.user?.id;
    if (!userId) {
      return { error: '로그인이 필요합니다.' };
    }
    const { error } = await updateNicknameRequest(userId, nextNickname);
    if (!error) {
      setNickname(nextNickname);
    }
    return { error };
  };

  const value: AuthContextValue = {
    user: session?.user ?? null,
    session,
    isLoading,
    nickname,
    isNicknameLoading,
    signUp,
    signIn,
    signOut,
    updateNickname,
  };

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- Provider와 함께 두는 것이 계획서 컨벤션(AuthContext.tsx 단일 파일)에 맞음
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }
  return ctx;
}
