import type { AiAnswer, AiQuestion, AiVerdict } from '../types/newWorry';

// docs/plans/local-only-migration.md "1. 고민(worries) 로컬 스토어": Supabase `worries` 테이블
// select/insert 대신 localStorage 하나로 동작하도록 재작성했다. export 이름(WorryStatus/
// WorryRecord/fetchRecentWorries/fetchOngoingWorries/createWorry)과 WorryRecord 필드 구성은
// 그대로 유지해 홈/고민목록/새고민생성의 파생 로직(worrySummary.ts, worryListDerive.ts)을
// 전혀 손대지 않아도 되게 했다. 바뀐 것은 내부 구현과, 로컬 단일 사용자 전제라 시그니처에서
// userId 파라미터를 제거한 것뿐이다.

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
  aiVerdict: AiVerdict | null;
}

// localStorage에 저장되는 row 형태. Date는 ISO 문자열로 저장한다(JSON-safe).
interface StoredWorryRow {
  id: string;
  name: string;
  price: number;
  category: string;
  thumbnailUrl: string | null;
  status: WorryStatus;
  createdAt: string;
  decidedAt: string | null;
  deadlineAt: string;
  aiQuestions: AiQuestion[];
  aiAnswers: AiAnswer[];
  aiVerdict: AiVerdict | null;
}

const STORAGE_KEY = 'meomchit:worries';
const SEED_VERSION_KEY = 'meomchit:worries:seedVersion';
// 개발 편의용: SEED_WORRIES(buildSeedWorries)의 내용을 바꿀 때마다 이 값을 올린다. ensureSeeded()가
// localStorage에 저장된 버전과 이 값을 비교해서 다르면(초회 방문 포함) 기존 데이터를 새 시드로
// 덮어쓴다 — 배포 전 개발 단계에서 목데이터를 계속 조정해도 브라우저 localStorage를 수동으로
// 지울 필요가 없게 하기 위함이다. 배포 후에는 이 상수를 더 이상 올리지 않으면 실사용자 데이터가
// 보존된다(트레이드오프: 버전을 올리면 그 시점까지 쌓인 로컬 데이터는 전부 시드로 교체된다).
const SEED_VERSION = 3;

function readAll(): StoredWorryRow[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAll(rows: StoredWorryRow[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(rows));
}

const SAMPLE_QUESTIONS: AiQuestion[] = [
  {
    question: '이 물건이 정말 필요한 이유가 있나요?',
    reason: '충동구매인지 확인하기 위한 질문이에요.',
    options: ['네, 꼭 필요해요.', '아니요, 필요 없어요.', '잘 모르겠어요.'],
  },
  {
    question: '집에 비슷한 물건이 이미 있나요?',
    reason: '중복 소비를 줄이기 위한 질문이에요.',
    options: ['아니요, 없어요.', '네, 있어요.', '잘 모르겠어요.'],
  },
  {
    question: '이 가격이 예산에 부담되지 않나요?',
    reason: '가격 적정성을 판단하기 위한 질문이에요.',
    options: ['부담 없어요.', '조금 부담돼요.', '잘 모르겠어요.'],
  },
  {
    question: '이 물건 없이 최근 한 달을 잘 지냈나요?',
    reason: '실제 필요성을 되돌아보기 위한 질문이에요.',
    options: ['네, 잘 지냈어요.', '아니요, 불편했어요.', '잘 모르겠어요.'],
  },
  {
    question: '지금 당장 사지 않으면 후회할 것 같나요?',
    reason: '충동성을 확인하기 위한 질문이에요.',
    options: ['후회할 것 같아요.', '후회하지 않을 것 같아요.', '잘 모르겠어요.'],
  },
];

const SAMPLE_ANSWERS: AiAnswer[] = SAMPLE_QUESTIONS.map((q, index) => ({
  question: q.question,
  answer: q.options[index % 2],
}));

const SAMPLE_VERDICT: AiVerdict = {
  verdict: 'necessary',
  title: '이 물건은 필요한 소비로 보여요',
  description:
    '답변을 종합해보면 실제로 필요해서 고민하고 있는 것으로 보여요. 그래도 24시간은 다시 한번 생각해보는 시간을 가져보세요.',
  scores: {
    necessity: { percent: 78, label: '높음' },
    impulsiveness: { percent: 32, label: '낮음' },
    priceFit: { percent: 65, label: '보통' },
  },
};

/** 최초 접속 시(또는 SEED_VERSION이 바뀌었을 때)만 심는 시드. 딱 2건만 둔다: 타이머가 끝나 결정
 * 대기로 넘어간 것 1건 + 타이머가 절반쯍 지난 진행 중인 것 1건. */
function buildSeedWorries(): StoredWorryRow[] {
  const now = Date.now();
  const HOUR = 60 * 60 * 1000;

  return [
    {
      id: 'seed-pending-1',
      name: '블루투스 키보드',
      price: 89000,
      category: '전자기기',
      thumbnailUrl: null,
      status: 'ongoing',
      createdAt: new Date(now - 26 * HOUR).toISOString(),
      decidedAt: null,
      // 이미 과거인 deadlineAt — deriveWorryListViews가 "지금 시각 ≥ deadlineAt"만으로
      // 자동으로 결정 대기로 분류하므로 별도 오버레이가 필요 없다.
      deadlineAt: new Date(now - 2 * HOUR).toISOString(),
      aiQuestions: SAMPLE_QUESTIONS,
      aiAnswers: SAMPLE_ANSWERS,
      aiVerdict: SAMPLE_VERDICT,
    },
    {
      id: 'seed-ongoing-half',
      name: '무선 청소기',
      price: 189000,
      category: '생활용품',
      thumbnailUrl: null,
      status: 'ongoing',
      // 24시간 중 절반(12시간)이 지난 상태 — createdAt이 12시간 전, deadlineAt이 12시간 후.
      createdAt: new Date(now - 12 * HOUR).toISOString(),
      decidedAt: null,
      deadlineAt: new Date(now + 12 * HOUR).toISOString(),
      aiQuestions: SAMPLE_QUESTIONS,
      aiAnswers: SAMPLE_ANSWERS,
      aiVerdict: SAMPLE_VERDICT,
    },
  ];
}

function ensureSeeded(): void {
  const storedVersion = window.localStorage.getItem(SEED_VERSION_KEY);
  if (storedVersion === String(SEED_VERSION)) return;

  writeAll(buildSeedWorries());
  window.localStorage.setItem(SEED_VERSION_KEY, String(SEED_VERSION));
}

function toWorryRecord(row: StoredWorryRow): WorryRecord {
  return {
    id: row.id,
    name: row.name,
    price: row.price,
    category: row.category,
    thumbnailUrl: row.thumbnailUrl,
    status: row.status,
    createdAt: new Date(row.createdAt),
    decidedAt: row.decidedAt ? new Date(row.decidedAt) : null,
    deadlineAt: new Date(row.deadlineAt),
    aiVerdict: row.aiVerdict ?? null,
  };
}

/**
 * 최근 worries를 조회한다. createdAt 또는 decidedAt이 sinceDate 이후인 row를 가져온다
 * (등록 시점이 아니라 이번 달에 포기/구매로 "결정"된 row도 놓치지 않기 위해 두 필드를 or로 본다).
 */
export async function fetchRecentWorries(
  sinceDate: Date,
): Promise<WorryRecord[]> {
  ensureSeeded();
  const start = sinceDate.getTime();

  return readAll()
    .filter((row) => {
      const createdAtMs = new Date(row.createdAt).getTime();
      const decidedAtMs = row.decidedAt
        ? new Date(row.decidedAt).getTime()
        : null;
      return createdAtMs >= start || (decidedAtMs !== null && decidedAtMs >= start);
    })
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    .map(toWorryRecord);
}

/**
 * "진행 중"(status === 'ongoing') worry를 기간 제한 없이 전부 조회한다. 고민 목록 화면은
 * 결정 대기까지 파생 상태로 다시 나누므로 status 필터만 걸고, deadline_at 오름차순으로
 * 정렬해둔다(화면에서는 어차피 "남은 시간순"으로 다시 정렬한다).
 */
export async function fetchOngoingWorries(): Promise<WorryRecord[]> {
  ensureSeeded();

  return readAll()
    .filter((row) => row.status === 'ongoing')
    .sort(
      (a, b) => new Date(a.deadlineAt).getTime() - new Date(b.deadlineAt).getTime(),
    )
    .map(toWorryRecord);
}

export interface CreateWorryInput {
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

/** "24시간 고민 시작하기" 클릭 시 딱 한 번 호출된다. deadlineAt은 여기서 now + 24h로 계산한다. */
export async function createWorry(
  input: CreateWorryInput,
): Promise<{ data: WorryRecord | null; error: string | null }> {
  ensureSeeded();

  const now = new Date();
  const deadlineAt = new Date(now.getTime() + TWENTY_FOUR_HOURS_MS);

  const row: StoredWorryRow = {
    id: crypto.randomUUID(),
    name: input.name,
    price: input.price,
    category: input.category,
    thumbnailUrl: input.thumbnailUrl,
    status: 'ongoing',
    createdAt: now.toISOString(),
    decidedAt: null,
    deadlineAt: deadlineAt.toISOString(),
    aiQuestions: input.aiQuestions,
    aiAnswers: input.aiAnswers,
    aiVerdict: input.aiVerdict,
  };

  const rows = readAll();
  rows.push(row);
  writeAll(rows);

  return { data: toWorryRecord(row), error: null };
}
