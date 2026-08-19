import { supabase } from './supabase';
import type { AiAnswer, AiQuestion, AiVerdict } from '../types/newWorry';

export type WorryStatus = 'ongoing' | 'abandoned' | 'purchased';

/** 화면/집계 로직에서 다루기 쉽도록 camelCase + Date로 정규화된 형태 */
export interface WorryRecord {
  id: string;
  name: string;
  price: number;
  category: string;
  thumbnailUrl: string | null;
  status: WorryStatus;
  createdAt: Date;
  decidedAt: Date | null;
  deadlineAt: Date;
}

interface WorryRow {
  id: string;
  name: string;
  price: number;
  category: string;
  thumbnail_url: string | null;
  status: WorryStatus;
  created_at: string;
  decided_at: string | null;
  deadline_at: string;
}

function toWorryRecord(row: WorryRow): WorryRecord {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    thumbnailUrl: row.thumbnail_url,
    status: row.status,
    createdAt: new Date(row.created_at),
    decidedAt: row.decided_at ? new Date(row.decided_at) : null,
    deadlineAt: new Date(row.deadline_at),
  };
}

/**
 * 로그인한 유저의 최근 worries를 조회한다.
 * created_at 또는 decided_at이 sinceDate 이후인 row를 가져온다.
 * (단순히 created_at만 필터링하면, 이전에 등록됐지만 이번 달에 포기/구매로
 * "결정"된 row를 놓칠 수 있어 두 컬럼을 or 조건으로 함께 본다.)
 */
export async function fetchRecentWorries(
  userId: string,
  sinceDate: Date,
): Promise<WorryRecord[]> {
  const start = sinceDate.toISOString();
  const { data, error } = await supabase
    .from('worries')
    .select(
      'id, name, price, category, thumbnail_url, status, created_at, decided_at, deadline_at',
    )
    .eq('user_id', userId)
    .or(`created_at.gte.${start},decided_at.gte.${start}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toWorryRecord);
}

// 이슈 #29(새 고민 생성): docs/plans/new-worry.md "src/lib 신규/변경 모듈 제안" 그대로.
export interface CreateWorryInput {
  userId: string;
  name: string;
  price: number;
  category: string;
  purchaseUrl: string | null;
  thumbnailUrl: string | null;
  aiQuestions: AiQuestion[];
  aiAnswers: AiAnswer[];
  aiVerdict: AiVerdict;
}

const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000;

/**
 * "24시간 고민 시작하기" 클릭 시 딱 한 번 호출되는 insert. deadline_at은 여기서
 * `now + 24h`로 계산한다(docs/plans/backend-setup.md 확인 완료 사항 그대로, 이번이 첫 사용처).
 */
export async function createWorry(
  input: CreateWorryInput,
): Promise<{ data: WorryRecord | null; error: string | null }> {
  const deadlineAt = new Date(Date.now() + TWENTY_FOUR_HOURS_MS);

  const { data, error } = await supabase
    .from('worries')
    .insert({
      user_id: input.userId,
      name: input.name,
      price: input.price,
      category: input.category,
      purchase_url: input.purchaseUrl,
      thumbnail_url: input.thumbnailUrl,
      status: 'ongoing',
      deadline_at: deadlineAt.toISOString(),
      ai_questions: input.aiQuestions,
      ai_answers: input.aiAnswers,
      ai_verdict: input.aiVerdict,
    })
    .select(
      'id, name, price, category, thumbnail_url, status, created_at, decided_at, deadline_at',
    )
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? 'insert 실패' };
  }

  return { data: toWorryRecord(data), error: null };
}
