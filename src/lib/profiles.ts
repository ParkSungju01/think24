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
