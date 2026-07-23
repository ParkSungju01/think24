# 백엔드(Supabase) 연동 설정 구현 계획

## 개요
- 이슈: #13 `[feat] backend 설정`
- 브랜치: `13-feat-backend-설정`
- 관련 화면: 홈 화면(`src/pages/Home`) — 그 외 화면(로그인 화면 포함)은 신설 여부부터 "확인 필요" 항목
- 범위: Supabase 클라이언트 초기화, `worries` 테이블 스키마/RLS, 이메일·비밀번호 인증 플로우, `src/mocks/home.ts` → 실제 Supabase 쿼리 교체, 월별 집계 로직 배치
- **범위 밖**: 알림(`/notifications`) 데이터 모델/화면. 아직 데이터 모델도 화면도 없으므로 이번 작업에서는 손대지 않는다.
- 한 줄 요약: Supabase(Auth + Postgres)를 프로젝트에 연결하고, 홈 화면이 더미 데이터 대신 실제 `worries` 데이터를 조회/집계해 렌더링하도록 인프라를 구축한다.

## 현재 상태 파악 (참고)
- `.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`가 이미 설정돼 있고 `.gitignore`에 `.env`가 포함되어 있어 안전하게 커밋되지 않는다.
- 패키지 매니저는 `pnpm`(`pnpm-lock.yaml` 존재). `@supabase/supabase-js`는 아직 미설치.
- `tsconfig.app.json`은 `types: ["vite/client"]`만 지정되어 있고, `import.meta.env`용 커스텀 타입 선언 파일(`vite-env.d.ts`)이 없다.
- `src/mocks/home.ts`가 `HomeData` 타입(`src/types/home.ts`)에 맞는 더미 데이터를 export하고, `src/pages/Home/index.tsx`가 이를 그대로 구조 분해해서 하위 컴포넌트(`HomeHeader`, `ContentGrid`, `TodayQuoteCard`)에 넘긴다.
- `SavedAmountCard`가 표시하는 "포기한 상품 N개 | 구매한 상품 N개"와 "지금까지 절약한 금액"은 모두 "이번 달"이라는 수식어 없이 표시된다 (즉 전체 누적으로 보이는 UI) — 아래 "확인 필요"에서 다룬다.
- `src/routes/paths.ts`에는 로그인/회원가입 라우트가 없다.

## 1. Supabase 클라이언트 설정

### 1-1. 패키지 설치
- `pnpm add @supabase/supabase-js`

### 1-2. 클라이언트 초기화 파일
- 위치: `src/lib/supabase.ts` (신규 — `src/lib/` 디렉터리 신설)
- 역할: 앱 전역에서 재사용할 단일 Supabase client 인스턴스를 생성해 export
- env 접근: `import.meta.env.VITE_SUPABASE_URL`, `import.meta.env.VITE_SUPABASE_ANON_KEY`
- 두 값이 비어 있으면(로컬에 `.env`가 없는 경우 등) 바로 알아챌 수 있도록, 클라이언트 생성 전 값 존재 여부를 확인하고 없으면 명확한 에러를 던지는 가드를 넣는다.
- 타입 안전성을 위해 `src/vite-env.d.ts`를 신규 생성해 `ImportMetaEnv` 인터페이스에 두 변수를 선언한다(현재 프로젝트에 이 파일이 없다).
- import는 프로젝트 컨벤션(상대 경로, path alias 미사용)을 따른다. 예: `import { supabase } from '../../lib/supabase'`

### 1-3. Supabase 대시보드에서 확인할 것 (코드가 아니라 콘솔 설정)
- Authentication > Providers에서 Email 활성화 여부
- Authentication > URL Configuration에 로컬 개발 주소(예: `http://localhost:5173`)가 Redirect URL로 등록돼 있는지
- 이 항목들은 developer 에이전트가 구현 중 Supabase 콘솔에서 직접 확인/설정해야 한다.

## 2. `worries` 테이블 스키마

핵심 엔티티는 "고민(worry)" 하나다. 컬럼 설계:

| 컬럼 | 타입 | 제약/기본값 | 설명 |
|---|---|---|---|
| `id` | `uuid` | PK, `default gen_random_uuid()` | |
| `user_id` | `uuid` | `not null`, FK `references auth.users(id) on delete cascade` | 소유자 |
| `name` | `text` | `not null` | 고민 중인 상품명 |
| `price` | `integer` | `not null`, `check (price >= 0)` | 원 단위 가격 |
| `thumbnail_url` | `text` | nullable | 상품 썸네일. 등록 기능이 아직 없어 당분간 null 허용 |
| `status` | `text` | `not null default 'ongoing'`, `check (status in ('ongoing','abandoned','purchased'))` | 진행/포기/구매 |
| `created_at` | `timestamptz` | `not null default now()` | 고민 등록 시각 |
| `decided_at` | `timestamptz` | nullable | 포기/구매로 확정된 시각. `ongoing`이면 `null` |
| `deadline_at` | `timestamptz` | `not null` | 타이머 종료 시각. `OngoingWorry.remainingSeconds`는 `deadline_at - now()`로 프론트에서 계산 |
| `updated_at` | `timestamptz` | `not null default now()` | 트리거로 자동 갱신 권장 |

### 참고 DDL (Supabase SQL Editor에서 실행)
```sql
create table public.worries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  price integer not null check (price >= 0),
  thumbnail_url text,
  status text not null default 'ongoing' check (status in ('ongoing', 'abandoned', 'purchased')),
  created_at timestamptz not null default now(),
  decided_at timestamptz,
  deadline_at timestamptz not null,
  updated_at timestamptz not null default now()
);

create index worries_user_status_idx on public.worries (user_id, status);
create index worries_user_created_at_idx on public.worries (user_id, created_at desc);
create index worries_user_decided_at_idx on public.worries (user_id, decided_at desc);

create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger worries_set_updated_at
before update on public.worries
for each row execute function public.set_updated_at();
```

### Row Level Security
로그인한 유저가 자기 소유 row만 읽고 쓸 수 있어야 한다.

```sql
alter table public.worries enable row level security;

create policy "worries_select_own" on public.worries
  for select using (auth.uid() = user_id);

create policy "worries_insert_own" on public.worries
  for insert with check (auth.uid() = user_id);

create policy "worries_update_own" on public.worries
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "worries_delete_own" on public.worries
  for delete using (auth.uid() = user_id);
```
- delete 정책은 "확인 필요"(고민 삭제 기능이 실제로 필요한지)에 따라 제외할 수도 있다.

## 3. 인증 플로우

- **회원가입**: `supabase.auth.signUp({ email, password })`
- **로그인**: `supabase.auth.signInWithPassword({ email, password })`
- **로그아웃**: `supabase.auth.signOut()`
- **세션 유지**: supabase-js 기본 설정(`persistSession: true`, `autoRefreshToken: true`)을 그대로 사용하면 localStorage에 세션이 저장되고 자동 갱신된다. `src/lib/supabase.ts`에서 옵션을 건드리지 않는 것을 권장.
- **세션 상태 전파**: 여러 화면(홈 등)에서 로그인한 `user_id`가 필요하므로, `supabase.auth.onAuthStateChange` 구독을 최상위에서 한 번만 두는 Auth Context를 신설 제안:
  - 위치: `src/contexts/AuthContext.tsx` (또는 `src/hooks/useAuth.ts`) — Provider가 `{ user, session, isLoading }`을 제공하고, `App.tsx`의 `<Routes>` 바깥을 감싼다.
  - 이 Provider가 있어야 홈 페이지에서 "현재 로그인한 user_id로 worries를 조회"하는 로직을 짤 수 있다.
- **로그인 화면**: 현재 `src/routes/paths.ts`에 로그인/회원가입 라우트가 없다. 새 라우트(예: `/login`)를 추가해야 하는지, 추가한다면 어떤 UI로 할지(피그마 디자인 없음)는 "확인 필요" 항목으로 남긴다.
- **비로그인 상태 접근 제어**(홈 화면 등 보호 라우트 여부)도 "확인 필요" 항목.

## 4. `src/mocks/home.ts` → 실제 Supabase 쿼리 교체 방향

- `HomeData` 타입(`src/types/home.ts`)과 `OngoingWorry`/`CategoryStat` 타입은 **그대로 유지**한다. 홈 화면 하위 컴포넌트(`SavedAmountCard`, `OngoingWorriesCard`, `MonthlySummaryCard`, `TodayQuoteCard` 등)는 props 인터페이스가 바뀌지 않으므로 수정할 필요가 없어야 한다.
- `src/mocks/home.ts`는 삭제하지 않고 남겨두되(개발 중 로딩 실패 시 폴백이나 향후 스토리북 용도로 쓸지는 developer 재량), 실제 페이지 렌더링에서는 더 이상 참조하지 않도록 전환한다.
- 신규 쿼리 모듈: `src/lib/worries.ts`
  - `fetchRecentWorries(userId: string, sinceDate: Date): Promise<WorryRow[]>` 형태의 함수 하나로 시작.
  - 날짜 범위를 좁히는 이유: `monthlySummary`(이번 달 vs 지난달 비교)에 필요한 것은 "지난달 1일 ~ 오늘"이면 충분하다.
  - 다만 단순히 `created_at >= 지난달 1일`로만 필터링하면, 그보다 이전에 등록됐지만 이번 달에 포기/구매로 "결정"된 row(`decided_at`이 최근이지만 `created_at`은 오래된 경우)를 놓칠 수 있다. 따라서 `created_at >= start OR decided_at >= start` 조건으로 가져오는 것을 권장 (supabase-js의 `.or()` 사용).
  - 예시:
    ```ts
    const start = startOfPreviousMonth(new Date()).toISOString();
    const { data, error } = await supabase
      .from('worries')
      .select('id, name, price, thumbnail_url, status, created_at, decided_at, deadline_at')
      .eq('user_id', userId)
      .or(`created_at.gte.${start},decided_at.gte.${start}`)
      .order('created_at', { ascending: false });
    ```
  - 단, "총 절약 금액"(`totalSavedAmount`)은 정의상 전체 누적값으로 보이는데 위 range 쿼리만으로는 정확히 계산할 수 없다 — "확인 필요" 항목 참고.
- 데이터 패칭 훅: `src/pages/Home/useHomeData.ts` (또는 `src/hooks/useHomeData.ts`)를 신설해 `fetchRecentWorries` 호출 + 집계 함수 호출을 캡슐화하고, `{ data: HomeData | null, isLoading, error }` 형태로 반환한다. `src/pages/Home/index.tsx`는 `homeMock` 대신 이 훅을 사용하도록 바꾼다.
- 로딩/에러/빈 상태 UI는 피그마에 명시돼 있지 않으므로 "확인 필요" 항목으로 남긴다(현재 `OngoingWorriesCard`는 빈 배열일 때 "등록된 고민이 없어요" 문구가 이미 있어 그 부분만은 그대로 활용 가능).

## 5. 월별 집계 로직 위치 제안

Supabase나 React에 의존하지 않는 순수 함수로 분리해 단위 테스트가 쉽도록 한다.

- 위치: `src/lib/worrySummary.ts`
- 제안 함수:
  - `computeTotalSavedAmount(worries): number` — 절약 금액의 정의(포기한 상품 price 합인지 등)가 "확인 필요" 항목이라 확정 후 구현
  - `computeMonthlySavedAmount(worries, targetMonth: Date): number`
  - `computeCategoryCounts(worries, targetMonth: Date): CategoryStat[]` — `registered`(해당 월 `created_at`)/`abandoned`/`purchased` 개수 + 전월 대비 `diffVsLastMonth`
  - `computeOngoingWorries(worries, now: Date): OngoingWorry[]` — `status === 'ongoing'`인 것 중 `remainingSeconds`(= `deadline_at - now`, 초 단위, 0 이상으로 clamp) 짧은 순으로 정렬해 최대 2개. `progressPercent`는 `(now - created_at) / (deadline_at - created_at) * 100`을 0~100 사이로 clamp해서 계산
- 이 함수들은 `src/lib/worries.ts`(데이터 조회)와 분리해서, `useHomeData` 훅에서 "조회 → 집계 → HomeData 조립" 순서로 조합한다.

## 작업 순서 제안 (developer 서브에이전트용)

1. `pnpm add @supabase/supabase-js` 설치, `src/vite-env.d.ts` 작성(env 타입 선언)
2. `src/lib/supabase.ts` 클라이언트 초기화 파일 작성
3. Supabase 대시보드에서 위 DDL로 `worries` 테이블 + 인덱스 + RLS 정책 생성, Email Auth Provider 활성화 확인
4. 인증 유틸/컨텍스트 작성: 회원가입/로그인/로그아웃 함수 + `AuthContext`(또는 `useAuth` 훅)로 현재 유저 세션 전역 제공
5. "확인 필요" 항목(로그인 화면 신설 여부 등) 답변을 반영해, 필요하다면 로그인 화면 라우트/컴포넌트 추가
6. `src/lib/worries.ts`에 `fetchRecentWorries` 등 조회 함수 작성 (범위 쿼리 포함)
7. `src/lib/worrySummary.ts`에 집계 순수 함수 작성
8. `src/pages/Home/useHomeData.ts` 훅으로 조회+집계 결합, `src/pages/Home/index.tsx`에서 `homeMock` 대신 이 훅 사용하도록 교체 (`HomeData` 타입/하위 컴포넌트 props는 변경 없음)
9. 로딩/에러/빈 상태 처리 반영 (확인 필요 답변 기준)
10. 수동 검증: 테스트 계정 회원가입 → Supabase 콘솔(또는 임시 insert)로 `worries` row 몇 개 생성 → 홈 화면에 실제 값이 반영되는지, RLS로 다른 유저 데이터가 보이지 않는지 확인

## 확인 완료 (사용자 승인)
- **로그인 화면**: 피그마 디자인 없이 이메일/비밀번호 입력만 있는 간단한 임시 UI로 지금 만든다. 라우트는 `/login`으로 신설.
- **비로그인 접근 제어**: 보호 라우트(홈 등)에 비로그인 상태로 접근하면 `/login`으로 리다이렉트한다.
- **`deadline_at` 계산**: 사용자 입력 없이 `created_at + 24시간`으로 자동 계산한다 ("고민 등록" 화면이 아직 없으므로, 이 부분은 이번 백엔드 설정에서 등록 시 자동 설정되는 로직으로만 준비해두고, 실제 "고민 등록" UI는 별도 이슈).
- **소셜 로그인**: 지원하지 않는다 (이메일/비밀번호만).
- **"오늘의 소비 한 줄" 소스**: DB 테이블 없이 프론트 고정 배열에서 매일 랜덤 선택.
- **`worries` 삭제 기능**: 이번 범위에서 삭제 UI는 만들지 않는다. RLS `delete` 정책은 나중을 대비해 그대로 둔다(당장 사용하지 않아도 무해함).
- **스키마 변경 관리**: 당분간 Supabase CLI/마이그레이션 파일 없이 콘솔 SQL Editor에서 수동 실행. 필요해지면 나중에 CLI 도입.

## 보류 (사용자가 별도 논의 후 결정 예정 — 이번 범위에서 구현하지 않음)
- **"지금까지 절약한 금액"(`totalSavedAmount`) 계산 범위**: 전체 누적인지, 최근 N개월 기준으로 의미를 재정의할지 아직 결정 전. 별도 회의 후 정할 예정이라 **이번 백엔드 설정 작업 범위에서 제외**한다.
  - developer는 `totalSavedAmount`를 실제 Supabase 계산 로직으로 연결하지 않는다. `computeTotalSavedAmount`는 구현하지 않거나, 구현하더라도 실제로 호출하지 말고 하드코딩된 `0`을 그대로 사용한다(기존에 이미 이렇게 되어 있음 — 유지만 하면 된다). 이 필드에 대해서는 추가로 질문하지 않아도 된다.
- **"절약 금액"의 정확한 정의**(포기한 상품 price 합인지 등)와 `SavedAmountCard`의 "포기한 상품/구매한 상품" 개수가 전체 누적 기준인지 이번 달 기준인지도 위 항목과 함께 나중에 결정.
