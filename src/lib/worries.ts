import { supabase } from './supabase';

export type WorryStatus = 'ongoing' | 'abandoned' | 'purchased';

/** 화면/집계 로직에서 다루기 쉽도록 camelCase + Date로 정규화된 형태 */
export interface WorryRecord {
  id: string;
  name: string;
  price: number;
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
      'id, name, price, thumbnail_url, status, created_at, decided_at, deadline_at',
    )
    .eq('user_id', userId)
    .or(`created_at.gte.${start},decided_at.gte.${start}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toWorryRecord);
}
