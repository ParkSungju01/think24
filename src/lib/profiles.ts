import { supabase } from './supabase';

/** 회원가입 성공 직후 profiles 테이블에 닉네임을 저장한다 (닉네임은 서비스 내 중복 허용, UNIQUE 없음) */
export async function createProfile(
  userId: string,
  nickname: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('profiles')
    .insert({ id: userId, nickname });
  return { error: error?.message ?? null };
}

/**
 * 로그인한 유저의 닉네임을 profiles 테이블에서 조회한다.
 * profiles 테이블 생성 이전에 만들어진 옛 테스트 계정 등 row가 없을 수 있으므로,
 * 조회 실패(에러) 또는 데이터 없음일 때는 예외를 던지지 않고 null을 반환한다
 * (호출부에서 이메일 기반 폴백을 적용할 수 있도록).
 */
export async function fetchNickname(userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('nickname')
    .eq('id', userId)
    .single();

  if (error || !data) {
    return null;
  }

  return data.nickname;
}
