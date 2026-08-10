import { supabase } from './supabase';

/**
 * 사용자당 1행(user_id UNIQUE)인 월 절약 목표를 저장/갱신한다.
 * 매월 자동 초기화되지 않고 수정 시 당월부터 반영되는 정책이라 upsert로 구현한다.
 */
export async function upsertGoal(
  userId: string,
  monthlyAmount: number,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('goals')
    .upsert(
      { user_id: userId, monthly_amount: monthlyAmount },
      { onConflict: 'user_id' },
    );
  return { error: error?.message ?? null };
}
