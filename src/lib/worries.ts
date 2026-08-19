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
  // docs/plans/worries-list.md 데이터/타입 설계: createWorry가 insert 시점에 이미 채워두는
  // 컬럼이지만 기존 select 목록엔 없어 누락돼 있었다. AI 배지(결정 시트/카드) 표시에 필요.
  aiVerdict: AiVerdict | null;
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
  ai_verdict: AiVerdict | null;
}

const WORRY_SELECT_COLUMNS =
  'id, name, price, category, thumbnail_url, status, created_at, decided_at, deadline_at, ai_verdict';

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
    aiVerdict: row.ai_verdict ?? null,
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
    .select(WORRY_SELECT_COLUMNS)
    .eq('user_id', userId)
    .or(`created_at.gte.${start},decided_at.gte.${start}`)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toWorryRecord);
}

/**
 * 로그인한 유저의 "진행 중"(status === 'ongoing') worry를 기간 제한 없이 전부 조회한다.
 * docs/plans/worries-list.md: 고민 목록 화면은 결정 대기/일시정지까지 파생 상태로 다시 나누므로
 * status 필터만 걸고, deadline_at 오름차순(초기 로드 순서)으로 정렬해둔다 — 화면에서는 어차피
 * "남은 시간순"으로 다시 정렬하지만 최초 응답 순서를 명확히 하기 위함.
 */
export async function fetchOngoingWorries(userId: string): Promise<WorryRecord[]> {
  const { data, error } = await supabase
    .from('worries')
    .select(WORRY_SELECT_COLUMNS)
    .eq('user_id', userId)
    .eq('status', 'ongoing')
    .order('deadline_at', { ascending: true });

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
    .select(WORRY_SELECT_COLUMNS)
    .single();

  if (error || !data) {
    return { data: null, error: error?.message ?? 'insert 실패' };
  }

  return { data: toWorryRecord(data), error: null };
}
