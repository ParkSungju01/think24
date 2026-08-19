# 완전 로컬(mock+localStorage) 전환 구현 계획

## 개요
- 피그마 링크: 없음 — 이번 작업은 새 화면이 아니라 기존 5개 화면(홈/고민목록/새고민생성/마이페이지/알림)의 **데이터 레이어를 Supabase(DB+Auth+Storage)에서 완전 로컬(mock 시드 + localStorage + 컴포넌트 상태)로 교체**하는 리팩터다.
- 관련 문서: `docs/adr/0005-remove-backend-auth-go-local-only.md`(이번 전환의 배경/결정 요약, 이미 작성 완료 — 이 계획서는 그 ADR을 실제 구현 단위로 분해한 것), `docs/plans/worries-list.md`(이슈 #46, `fetchOngoingWorries`/파생 로직의 원 설계), `docs/adr/0004-worries-list-confirm-and-pause-are-local-only.md`(확정/일시정지/삭제가 이미 로컬 전용이라는 전제), `docs/adr/0003-spending-record-fully-static-mock.md`(정적 mock 패턴 전례).
- 한 줄 요약: 로그인/회원가입/`ProtectedRoute`를 라우팅에서 제거해 계정 없이 앱을 바로 열게 하고, `worries`/`profiles`/`notifications`/`goals` 테이블 의존을 없애 홈·고민목록·마이페이지·알림을 localStorage/mock 기반으로 바꾾다. AI 질문·판정 Edge Function만 예외적으로 유지하되 인증 체크를 IP 기준 요청 제한으로 대체한다.
- 작업 단위: 이슈/브랜치 1개로 진행(그릴링 결과 확정, 여러 개로 쪼개지 않음).

## 현재 구조 → 전환 후 구조 (한눈에)

| 영역 | 현재 | 전환 후 |
|---|---|---|
| 로그인/회원가입 | `/login`, `/signup`, `/signup/complete` 라우트 + `ProtectedRoute`로 나머지 라우트 보호 | 전부 라우팅에서 제거. 앱은 `/`부터 계정 없이 바로 열림. 소스 파일은 삭제하지 않고 라우팅에서만 뺀다(죽은 코드로 유지) |
| 전역 인증 상태 | `AuthProvider`(`AuthContext.tsx`)가 `App.tsx` 최상위를 감싸고 `session`/`user`/`nickname`을 제공 | `AuthProvider`를 `App.tsx`에서 제거. 대신 닉네임만 다루는 신규 `NicknameProvider`(`src/contexts/NicknameContext.tsx`)가 그 자리를 대체 |
| 고민(worries) | `src/lib/worries.ts`가 Supabase `worries` 테이블 select/insert, 호출부가 `user.id` 필요 | 같은 파일(`src/lib/worries.ts`)을 localStorage 기반으로 재작성. `WorryRecord` 타입/함수 이름은 유지하되 `userId` 파라미터는 제거(단일 로컬 사용자 전제) |
| 닉네임 | `src/lib/profiles.ts`(Supabase `profiles` 테이블) + `AuthContext`가 전역 보관 | **신규** `src/lib/localNickname.ts`(localStorage) + `NicknameContext`. 기존 `profiles.ts`는 건드리지 않고 그대로 둔다(죽은 `AuthContext.tsx`가 여전히 참조하기 때문 — 아래 "죽은 코드 처리 방침" 참고) |
| 알림 | `src/lib/notifications.ts`(Supabase CRUD) + `NotificationsContext`가 `user` 변경 시 재조회 | `notifications.ts`를 정적 mock 배열 export로 재작성. `NotificationsContext`는 mount 시 그 배열을 초기 상태로 삼고, 읽음/삭제는 전부 컴포넌트 상태로만 처리(영속화 없음 — ADR-0004와 동일한 패턴) |
| 상품 썸네일 | `src/lib/worryThumbnails.ts`가 Supabase Storage 업로드 | 같은 파일을 리사이즈 후 base64 data URL을 반환하는 순수 프론트 로직으로 재작성 |
| 절약 목표 | `src/lib/goals.ts`(Supabase `goals` upsert), `SignupComplete`에서만 호출 | `goals.ts` 삭제. `SignupComplete`는 라우팅에서 이미 빠지므로 그 안의 `upsertGoal` 호출부만 제거(파일 자체는 남김) |
| AI 질문/판정 | Edge Function 호출 시 `supabase.functions.invoke()`(JWT 자동 첨부) → Edge Function이 `requireAuthenticatedUser()`로 로그인 검증 | 프론트는 `fetch()`로 Edge Function URL 직접 POST(로그인 불필요). Edge Function은 인증 체크 제거 + IP 기준 요청 제한(rate limit) 추가 |
| `@supabase/supabase-js` | 프론트 전역 의존(`src/lib/supabase.ts`) | **패키지 자체는 유지**하되 실제로 동작하는(라우팅에 연결된) 코드 경로에서는 더 이상 쓰지 않는다 — 유일한 남은 참조는 죽은 `AuthContext.tsx`/`profiles.ts`(아래 항목에서 이유 설명). AI 호출은 `fetch()`로 대체해 이 SDK와 무관해진다 |

## 데이터 레이어 설계

### 1. 고민(worries) 로컬 스토어 — `src/lib/worries.ts` 재작성

기존 export 이름(`WorryStatus`, `WorryRecord`, `fetchRecentWorries`, `fetchOngoingWorries`, `createWorry`)과 `WorryRecord`의 필드 구성은 그대로 유지한다. 홈/고민목록/새고민생성이 이 인터페이스를 그대로 받아쓰므로, 파생 로직(`worrySummary.ts`, `worryListDerive.ts`)은 수정할 필요가 없다. 바뀌는 것은 세 함수의 **구현**과 **시그니처에서 `userId` 파라미터를 제거**하는 것(로컬 단일 사용자 전제라 사용자 구분이 불필요).

```ts
// localStorage에 저장되는 row 형태. 기존 Supabase 컬럼과 동일한 필드를 camelCase 없이
// snake_case가 아니라 그대로 JSON-safe하게 저장한다(Date는 ISO 문자열로).
interface StoredWorryRow {
  id: string;
  name: string;
  price: number;
  category: string;
  thumbnailUrl: string | null;
  status: WorryStatus;
  createdAt: string;   // ISO
  decidedAt: string | null;
  deadlineAt: string;  // ISO
  aiQuestions: AiQuestion[];
  aiAnswers: AiAnswer[];
  aiVerdict: AiVerdict | null;
}

const STORAGE_KEY = 'meomchit:worries';
const SEEDED_FLAG_KEY = 'meomchit:worries:seeded';
const PAUSED_SEED_KEY = 'meomchit:worries:seedPausedId'; // 아래 "일시정지 시드" 참고

function readAll(): StoredWorryRow[] { /* localStorage.getItem → JSON.parse, 없으면 [] */ }
function writeAll(rows: StoredWorryRow[]): void { /* JSON.stringify → localStorage.setItem */ }

/** 최초 1회(SEEDED_FLAG_KEY 없을 때)만 SEED_WORRIES를 STORAGE_KEY에 써넣는다.
 *  fetchRecentWorries/fetchOngoingWorries/createWorry가 호출될 때마다 먼저 이 함수를 거친다. */
function ensureSeeded(): void { ... }

export async function fetchRecentWorries(sinceDate: Date): Promise<WorryRecord[]> { ... }
export async function fetchOngoingWorries(): Promise<WorryRecord[]> { ... }
export async function createWorry(input: Omit<CreateWorryInput, 'userId'>): Promise<{ data: WorryRecord | null; error: string | null }> { ... }
```

- `async`/`Promise` 시그니처는 그대로 유지한다(실제로는 동기 로컬 연산이지만, 호출부(`useHomeData`/`useWorriesListData`/`useNewWorryFlow`)가 `await`하는 형태를 그대로 재사용할 수 있어 변경 범위가 작다).
- `createWorry`는 `crypto.randomUUID()`로 `id` 생성, `deadlineAt = now + 24h` 계산까지 기존 로직과 동일하게 유지한다. `CreateWorryInput`에서 `userId` 필드만 제거.

#### 초기 시드 데이터 (결정사항 8)
앱을 처음 열었을 때(`SEEDED_FLAG_KEY`가 없을 때) `SEED_WORRIES` 상수를 심는다. 이슈 #46 계획(`docs/plans/worries-list.md`)이 정의한 파생 상태를 각각 최소 1건 포함해야 하므로, 시드는 다음 3~4건으로 구성한다(정확한 상품명/가격/카테고리는 구현 시 자유롭게 정해도 무방 — 데모용 예시 데이터라 문구 자체는 중요하지 않음):
  1. **진행 중(ongoing)**: `deadlineAt`이 미래(예: 지금부터 약 18시간 뒤)인 `ongoing` row. `aiVerdict`도 함께 채워 AI 배지가 보이게 한다.
  2. **일시정지 예시용 진행 중(ongoing)**: 역시 `deadlineAt`이 미래인 `ongoing` row. 이 row의 `id`를 시드 시점에 `PAUSED_SEED_KEY`에 별도로 기록해둔다.
  3. **결정 대기(pending)**: `status: 'ongoing'`이지만 `deadlineAt`이 이미 과거(예: 지금부터 2시간 전)인 row — 고민목록 화면의 `deriveWorryListViews`가 "지금 시각 ≥ deadlineAt"만으로 자동으로 결정 대기로 분류하므로 별도 오버레이가 필요 없다.
- **일시정지는 저장된 필드가 아니라 화면 전용 오버레이(`useWorriesListData`의 컴포넌트 상태)라 row 자체로는 시드할 수 없다.** 대신 `PAUSED_SEED_KEY`에 2번 row의 id를 적어두고, `useWorriesListData`가 마운트 시 이 키를 **한 번만** 읽어 소비(즉시 `localStorage.removeItem`)하면서 그 id로 `pausedOverlays` 초기값을 채운다(잔여시간 스냅샷은 그 시점의 `deadlineAt - now`로 계산). 이렇게 하면:
  - 최초 접속 시엔 일시정지 카드가 바로 보인다(요구사항 충족).
  - 이후 새로고침하면 이미 소비된 키라 다시 일시정지되지 않고, 저장된 진짜 상태(`ongoing`)로 보인다 — ADR-0004("일시정지는 새로고침하면 초기화된다")와 충돌하지 않는다.
- 리셋(초기화) 기능은 만들지 않는다(결정사항 8) — `SEEDED_FLAG_KEY`가 한 번 세팅되면 이후로는 사용자가 만들거나 지운 고민이 계속 누적된다.

### 2. 닉네임 로컬 스토어 — 신규 `src/lib/localNickname.ts` + `src/contexts/NicknameContext.tsx`

`src/lib/profiles.ts`는 **수정하지 않고 그대로 둔다**(이유는 "죽은 코드 처리 방침" 참고 — 죽은 `AuthContext.tsx`가 계속 이 파일의 기존 Supabase 기반 함수를 참조해야 하기 때문). 대신 완전히 새 파일/새 Context를 만든다.

```ts
// src/lib/localNickname.ts
const NICKNAME_KEY = 'meomchit:nickname';
export const DEFAULT_NICKNAME = '고민러'; // 사용자가 바로 바꿀 수 있어 정확한 문구는 중요하지 않음(결정사항 3)

export function getNickname(): string {
  return window.localStorage.getItem(NICKNAME_KEY) ?? DEFAULT_NICKNAME;
}
export function setNickname(next: string): void {
  window.localStorage.setItem(NICKNAME_KEY, next);
}
```

```tsx
// src/contexts/NicknameContext.tsx — AuthContext가 하던 "닉네임 전역 공유" 역할만 이어받는다.
interface NicknameContextValue {
  nickname: string;
  updateNickname: (next: string) => void; // 동기, 에러 케이스 없음(로컬 쓰기라 실패하지 않음)
}
export function NicknameProvider({ children }: { children: ReactNode }) {
  const [nickname, setNicknameState] = useState(getNickname());
  const updateNickname = (next: string) => {
    setNickname(next);       // localStorage 쓰기
    setNicknameState(next);  // 리렌더
  };
  return <NicknameContext.Provider value={{ nickname, updateNickname }}>{children}</NicknameContext.Provider>;
}
export function useNickname(): NicknameContextValue { ... }
```

- `App.tsx`에서 `AuthProvider` 자리를 `NicknameProvider`로 대체한다(아래 "라우팅 변경" 참고).
- 홈 화면 "✨ {닉네임}님," (`HomeHeader`)과 마이페이지 닉네임 수정 폼이 이 Context를 공유한다.
- 마이페이지 저장은 더 이상 실패할 수 있는 비동기 작업이 아니므로(`updateNickname`이 동기), `MyPage`의 "저장 실패" 토스트 분기는 제거하고 항상 성공 토스트만 보여준다.

### 3. 알림 mock 전환 — `src/lib/notifications.ts` + `NotificationsContext.tsx` 재작성

`src/lib/notifications.ts`를 Supabase CRUD 대신 **정적 배열 하나만 export**하는 파일로 바꾼다.

```ts
// src/lib/notifications.ts
export const MOCK_NOTIFICATIONS: NotificationItem[] = [
  // 이슈 #17/#31 이전에 쓰던 더미 데이터와 유사한 톤으로 4~5개 구성.
  // isRead는 일부 true/false 섞어서 "안읽음" 배지가 보이는 상태로 시작.
];
```

`NotificationsContext.tsx`는 `useAuth()`/`user` 의존을 제거하고, mount 시 `MOCK_NOTIFICATIONS`를 초기 상태로 얹는다. 외부에 노출하는 인터페이스(`notifications`, `isLoading`, `hasUnread`, `markAsRead`, `markAllAsRead`, `deleteNotification`, `deleteAll`)는 전혀 바꾸지 않는다 — `NotificationsPage`/`NotificationBell` 등 소비하는 컴포넌트는 수정할 필요가 없다.

```tsx
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);
  // isLoading은 이제 항상 즉시 false — 필드는 인터페이스 호환을 위해 유지.
  const isLoading = false;

  const markAsRead = (id: string) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  const markAllAsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  const deleteNotification = (id: string) =>
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  const deleteAll = () => setNotifications([]);
  // ... hasUnread는 기존과 동일한 useMemo
}
```

- 읽음/삭제는 전부 컴포넌트 상태로만 처리하고 어디에도 영속화하지 않는다(결정사항 7 — "로컬 상태로만 처리", ADR-0004와 동일한 톤). 새로고침하면 `MOCK_NOTIFICATIONS` 원본으로 되돌아간다.
- Supabase 호출이 전부 사라지므로 `try/catch`, `.then(({error}) => ...)` 에러 로깅 코드도 함께 제거한다.

### 4. 상품 썸네일 로컬 저장 — `src/lib/worryThumbnails.ts` 재작성

```ts
// src/lib/worryThumbnails.ts
const MAX_DIMENSION = 480; // px, 긴 쪽 기준
const JPEG_QUALITY = 0.72;

export async function uploadWorryThumbnail(
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  try {
    const dataUrl = await resizeToDataUrl(file, MAX_DIMENSION, JPEG_QUALITY);
    return { url: dataUrl, error: null };
  } catch (err) {
    console.error('썸네일 리사이즈 실패:', err);
    return { url: null, error: '이미지 처리에 실패했습니다.' };
  }
}

async function resizeToDataUrl(file: File, maxDimension: number, quality: number): Promise<string> {
  // 1) FileReader로 원본을 data URL로 읽음
  // 2) new Image()에 그 data URL을 로드
  // 3) 긴 쪽이 maxDimension을 넘으면 비율 유지 축소, <canvas>에 drawImage
  // 4) canvas.toDataURL('image/jpeg', quality) 반환
}
```

- 함수 시그니처에서 `userId` 제거(호출부 `useNewWorryFlow.ts`도 함께 수정).
- **`URL.createObjectURL` 대신 base64 data URL을 선택한다**: object URL은 현재 세션의 메모리에만 유효해 새로고침하면 깨지므로, `localStorage`에 넣어 재방문 시에도 유지해야 하는 이 프로젝트 요구사항(결정사항 8 — 데이터 누적)에 맞지 않는다.
- 480px/품질 0.72 기준으로 사진 한 장당 대략 수십~150KB 내외로 예상된다. localStorage 용량(브라우저별 통상 5~10MB)을 고려해, 데모에서 다루는 고민 개수(수십 건 이내)로는 여유가 충분하다고 판단한다. 정확한 리사이즈 파라미터는 구현 중 실제 용량을 보고 조정 가능(값 자체는 구현 세부사항이라 확정 아님).
- 이미지가 없는 경우(사용자가 첨부하지 않음)는 기존과 동일하게 `thumbnailUrl: null`.

### 5. 절약 목표(goals) 제거

- `src/lib/goals.ts` 파일 삭제.
- `src/pages/SignupComplete/index.tsx`에서 `import { upsertGoal } from '../../lib/goals';`와 `handleStart` 내부의 `await upsertGoal(user.id, goalAmount)` 호출부만 제거한다(결정사항 5가 명시적으로 허용한 정리 범위). `handleStart`는 이제 유효성 검사만 통과하면 `handleSkip`과 동일하게 `clearSignupJustCompletedFlag()` + `navigate(ROUTES.home, { replace: true })`로 끝난다. 나머지(금액 입력 UI, 칩 선택 등)는 이 페이지가 어차피 라우팅에서 빠지는 죽은 화면이라 굳이 다 걷어낼 필요는 없다(결정사항 5, "파일 전체가 안 쓰이니 그대로 둬도 무방").
- `CONTEXT.md`는 이미 "절약 목표" 용어를 삭제해둔 상태(재작업 불필요).

## 라우팅 변경 — `src/App.tsx`

```tsx
function App() {
  return (
    <NicknameProvider>
      <NotificationsProvider>
        <Routes>
          <Route element={<LandingLayout />}>
            <Route element={<AppLayout />}>
              <Route path={ROUTES.home} element={<HomePage />} />
              <Route path={ROUTES.newWorry} element={<NewWorryPage />} />
              <Route path={ROUTES.worries} element={<WorriesPage />} />
              <Route path={ROUTES.records} element={<RecordsPage />} />
              <Route path={ROUTES.mypage} element={<MyPage />} />
            </Route>
            <Route path={ROUTES.notifications} element={<NotificationsPage />} />
          </Route>
        </Routes>
      </NotificationsProvider>
    </NicknameProvider>
  );
}
```

- 제거: `ProtectedRoute` 감싸기, `AuthProvider` 감싸기, `ROUTES.login`/`ROUTES.signup`/`ROUTES.signupComplete` 라우트 3개와 그 `element`(`LoginPage`/`SignUpPage`/`SignupCompletePage`) import.
- `src/routes/paths.ts`의 `ROUTES` 객체 자체는 건드리지 않는다 — `login`/`signup`/`signupComplete` 키가 죽은 파일들(`ProtectedRoute.tsx`, `SignupComplete/index.tsx` 등) 안에서 여전히 참조되므로 그대로 둬야 한다. 안 쓰는 라우트 상수가 몇 개 남는 것은 무해하다.
- `NotificationsPage`는 기존처럼 `AppLayout`(하단 네비/상단바) 밖의 독립 풀스크린 라우트로 유지(변경 없음).

## 죽은 코드 처리 방침 — `AuthContext`/`ProtectedRoute`/`Login`/`SignUp`/`SignupComplete`

결정사항 2에 따라 이 5개 파일(`src/contexts/AuthContext.tsx`, `src/components/auth/ProtectedRoute.tsx`, `src/pages/Login/index.tsx`, `src/pages/SignUp/index.tsx`, `src/pages/SignupComplete/index.tsx`)은 **삭제하지 않고 그대로 둔다**. 다만 이 프로젝트의 `tsc -b`(빌드 1단계)는 `tsconfig.app.json`의 `include: ["src"]`로 인해 **App.tsx에서 참조하지 않아도 `src/` 하위 모든 파일을 타입체크한다.** 따라서 이 죽은 파일들이 계속 정상적으로 컴파일되도록 아래를 지킨다:

- **`src/lib/supabase.ts`는 수정하지 않고 그대로 둔다.** `AuthContext.tsx`가 `supabase.auth.*`를 계속 참조하기 때문. `.env`의 `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`도 그대로 유지한다(이 파일이 모듈 로드 시점에 두 값이 없으면 `throw`하는데, `AuthContext.tsx`가 런타임에 더는 로드되지 않으므로 — `App.tsx`가 더 이상 import하지 않아 Vite 번들 그래프에서 도달 불가능해짐 — 실행 중 문제는 없지만, 값 자체를 지우면 이후 누군가 실수로 다시 연결했을 때 바로 에러가 나므로 안전하게 남겨둔다).
- **`src/lib/profiles.ts`도 수정하지 않고 그대로 둔다.** `AuthContext.tsx`의 `fetchNickname`/`updateNickname` 참조가 이 파일의 기존 시그니처를 그대로 써야 하기 때문. 그래서 닉네임의 "로컬 버전"은 `profiles.ts`를 고쳐 쓰는 게 아니라 **완전히 새 파일**(`localNickname.ts`)로 만든다(위 "2. 닉네임 로컬 스토어" 참고) — 이렇게 하면 살아있는 코드(마이페이지/홈)와 죽은 코드(`AuthContext`)가 서로 다른 파일을 봐서 충돌하지 않는다.
- **`@supabase/supabase-js` 패키지(의존성)는 `package.json`에서 제거하지 않는다.** `src/lib/supabase.ts`(값 import)와 `AuthContext.tsx`(`import type { Session, User } from '@supabase/supabase-js'`)가 여전히 이 패키지를 참조하므로, 패키지를 지우면 죽은 파일들의 타입체크가 깨져 빌드가 실패한다. 대신 **살아있는 기능 경로(AI 호출)는 이 SDK를 전혀 쓰지 않도록** 바꿔 SDK에 대한 "기능적 의존"은 없앤다(아래 "AI Edge Function 호출부 변경" 참고) — 패키지가 `node_modules`/`package.json`에는 남지만, 죽은 코드에서만 쓰이므로 Vite 프로덕션 번들에는 포함되지 않는다(도달 불가능한 모듈은 번들러가 트리쉐이킹한다).
- `goals.ts` 파일은 삭제하지만, 이를 참조하던 `SignupComplete/index.tsx`는 위 "5. 절약 목표 제거"에서 설명한 대로 그 호출부만 고쳐 계속 컴파일되게 한다.

## AI 관련 변경

### Edge Function — 인증 제거 + rate limit 추가

두 함수(`supabase/functions/ai-generate-questions/index.ts`, `supabase/functions/ai-generate-verdict/index.ts`) 공통:

1. `import { requireAuthenticatedUser } from '../_shared/auth.ts';`와 `const authResult = await requireAuthenticatedUser(req); if ('errorResponse' in authResult) { return authResult.errorResponse; }` 블록을 제거한다. `_shared/auth.ts` 파일 자체는 삭제해도 무방(더 이상 아무도 import하지 않음).
2. **`supabase/config.toml`에서 두 함수의 `verify_jwt = true`를 `verify_jwt = false`로 바꾼다.** 이건 `requireAuthenticatedUser()` 제거와는 별개의, Supabase 플랫폼(Kong 게이트웨이) 레벨 JWT 검증 설정이다 — 이 값을 안 바꾸면 함수 코드에서 인증 체크를 지워도 플랫폼이 Authorization 헤더 없는(또는 anon key만 있는) 요청을 여전히 401로 막는다. 로컬 코드에서 인증 로직을 지우는 것과 이 설정 변경은 **둘 다** 필요하다.
3. `_shared/rateLimit.ts` 신규 생성, 두 함수가 공통으로 import:

```ts
// supabase/functions/_shared/rateLimit.ts
const WINDOW_MS = 10 * 60 * 1000; // 10분
const MAX_REQUESTS_PER_WINDOW = 5; // IP당, 함수(엔드포인트)별로 각각 적용

const requestLog = new Map<string, number[]>(); // ip -> timestamps(ms)

export function checkRateLimit(ip: string): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);

  if (timestamps.length >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterMs = WINDOW_MS - (now - timestamps[0]);
    requestLog.set(ip, timestamps);
    return { allowed: false, retryAfterSeconds: Math.ceil(retryAfterMs / 1000) };
  }

  timestamps.push(now);
  requestLog.set(ip, timestamps);
  return { allowed: true, retryAfterSeconds: 0 };
}

export function getClientIp(req: Request): string {
  // Supabase Edge Runtime은 x-forwarded-for에 클라이언트 IP를 싣는다.
  const forwarded = req.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() ?? 'unknown';
}
```

각 함수의 `Deno.serve` 진입부(메서드 체크 다음, 기존 인증 체크가 있던 자리)에 추가:

```ts
const ip = getClientIp(req);
const rateLimitResult = checkRateLimit(ip);
if (!rateLimitResult.allowed) {
  return jsonResponse(
    { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
    429,
  );
}
```

- **범위**: 제한은 함수(엔드포인트)별로 독립 적용된다(질문 생성 5회/10분, 판정 생성 5회/10분 — 합쳐서 10회가 아니라 각각). 두 함수는 별도 Deno 인스턴스로 배포되므로 메모리를 공유할 수 없어, 하나의 인메모리 맵으로 두 엔드포인트를 합산 제한하는 것은 불가능하다. 일반적인 사용 흐름(고민 1건당 질문 생성 1회 + 판정 생성 1회)에는 여유 있는 한도다.
- 이 인메모리 방식은 함수 인스턴스가 콜드스타트로 재시작되면 카운터가 리셋된다는 한계가 있음을 감수한다(ADR-0005에 이미 기록된 결정, 재론하지 않음).
- `requireAuthenticatedUser` 제거로 `RequestBody` 검증(필수 필드 체크)은 그대로 유지(로그인 여부와 무관한 별개 검증이므로 손대지 않음).

### 프론트엔드 AI 호출부 변경 — `src/lib/aiWorryAssistant.ts`

`supabase.functions.invoke()` 대신 **`fetch()`로 Edge Function URL을 직접 POST**한다. 그러면 이 파일이 더 이상 `@supabase/supabase-js`를 import하지 않는다.

```ts
// src/lib/aiWorryAssistant.ts (발췌)
const FUNCTIONS_BASE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1`;

async function invokeEdgeFunction<T>(
  name: 'ai-generate-questions' | 'ai-generate-verdict',
  body: unknown,
): Promise<{ data: T | null; error: string | null }> {
  try {
    const response = await fetch(`${FUNCTIONS_BASE_URL}/${name}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await response.json().catch(() => null);
    if (!response.ok) {
      return { data: null, error: json?.error ?? `AI 요청에 실패했습니다. (${response.status})` };
    }
    return { data: json as T, error: null };
  } catch (err) {
    console.error(`${name} 호출 실패:`, err);
    return { data: null, error: 'AI 요청에 실패했습니다.' };
  }
}
```

- `generateWorryQuestions`/`generateWorryVerdict`는 내부적으로 `supabase.functions.invoke` 호출부만 위 `invokeEdgeFunction`으로 바꾸고, 반환 형태(`{ questions, error }` / `{ verdict, error }`)와 에러 메시지 우선순위(우리 함수가 내려준 한국어 `error` 우선, 그 외엔 고정 문구) 로직은 그대로 유지한다.
- `verify_jwt = false`로 바뀐 뒤에는 Authorization/apikey 헤더 없이도 호출이 성공해야 한다 — 구현 중 실제로 헤더 없이 호출해보고 200이 오는지 확인 필요(플랫폼 설정이라 planner가 사전에 100% 보장할 수 없는 부분, 개발 단계에서 실측 확인).
- **`VITE_SUPABASE_URL`은 계속 필요하다**(Edge Function 엔드포인트를 구성하기 위해). `VITE_SUPABASE_ANON_KEY`는 이제 살아있는 코드 경로에서는 쓰이지 않지만, `src/lib/supabase.ts`(죽은 `AuthContext.tsx`용)가 여전히 참조하므로 `.env`에서 지우지 않는다.

## 영향 받는 화면/모듈별 변경 상세

### 홈 화면 (`/`, `src/pages/Home/`)
- `useHomeData.ts`: `useAuth()` import/호출 제거. `nickname`/`isNicknameLoading`은 신규 `useNickname()`(동기, 로딩 상태 없음)으로 대체. `fetchRecentWorries(user.id, since)` → `fetchRecentWorries(since)`로 변경(더 이상 `if (!user) return` 가드 불필요, effect는 마운트 시 무조건 실행). 나머지(집계 로직, `todayQuote`, 하드코딩된 절약 금액)는 변경 없음.
- `HomeHeader` 등 프레젠테이션 컴포넌트는 변경 없음(props로 `userName` 문자열만 받으므로).

### 고민 목록 (`/worries`, `src/pages/Worries/`)
- `useWorriesListData.ts`: `useAuth()` 제거. `fetchOngoingWorries(user.id)` → `fetchOngoingWorries()`. `pausedOverlays` 초기값을 `{}` 대신, 마운트 시 새로 만들 `consumePausedSeedWorryId()`(`src/lib/worries.ts`가 함께 export)를 한 번 호출해 시드된 일시정지 대상이 있으면 초기 오버레이를 채운다(위 "1. 고민 로컬 스토어 > 초기 시드 데이터" 참고).
- `deriveWorryListViews`/`worryListDerive.ts`/`useNowTick`/타입(`src/types/worriesList.ts`) 등은 이슈 #46에서 이미 확정된 순수 로직이라 **전혀 수정하지 않는다** — `fetchOngoingWorries`가 반환하는 `WorryRecord[]` 형태가 그대로 유지되므로 이 함수들은 데이터 소스가 Supabase든 localStorage든 신경 쓰지 않는다.
- 확정/일시정지/삭제가 로컬 오버레이로만 처리된다는 ADR-0004의 전제는 이번 전환으로 오히려 더 자연스러워진다(이제 "로컬"이 유일한 데이터 계층이므로).

### 새 고민 생성 (`/worries/new`, `src/pages/NewWorry/`)
- `index.tsx`: `useAuth()`/`user` 제거. `useNewWorryFlow(user?.id)` → `useNewWorryFlow()`(파라미터 없음).
- `useNewWorryFlow.ts`: `userId` 파라미터 제거. `startTimer()`의 `if (!userId || ...)` 가드에서 `userId` 부분 제거. `uploadWorryThumbnail(userId, file)` → `uploadWorryThumbnail(file)`. `createWorry({ userId, ... })` → `userId` 필드 제거.
- AI 질문/판정 호출(`generateWorryQuestions`/`generateWorryVerdict`)은 이미 로그인과 무관하게 동작하도록 Edge Function 쪽이 바뀌므로 이 파일에서 추가로 손댈 것은 없다(내부적으로 이미 `aiWorryAssistant.ts`가 알아서 `fetch()`로 바뀜).

### 마이페이지 (`/mypage`, `src/pages/MyPage/index.tsx`)
- `useAuth()` 전체 제거. 대신 `useNickname()`으로 `nickname`/`updateNickname`을 받는다.
- 닉네임 입력창 초기값: 기존의 "로딩 끝난 뒤 1회만 채우는" `useEffect`+`ref` 패턴이 불필요해진다(`nickname`이 이제 동기적으로 항상 존재) — `useState(nickname)`으로 바로 초기화 가능. 다만 사용자가 입력 중인 값을 다른 렌더에서 덮어쓰지 않도록, 최초 마운트 시 한 번만 초기화하는 형태는 유지해도 무방(구현 세부사항).
- 이메일 prefix 폴백 로직(`user?.email?.split('@')[0]`) 삭제 — 계정이 없으므로 이메일 자체가 없다.
- **로그아웃 버튼/모달 전체 삭제**(결정사항 4): `isLogoutModalOpen` 상태, `handleLogout` 함수, 하단 "로그아웃" `<button>`, `ConfirmModal` 렌더 블록을 제거한다. `signOut` 관련 import도 함께 제거.
- 저장 실패 케이스 삭제(로컬 쓰기는 실패하지 않음) — 저장 시 항상 성공 토스트만 보여준다.
- 아바타 영역(정적 이미지, 변경 불가)은 그대로 유지 — 이번 전환과 무관.

### 알림 (`/notifications`, 벨 드롭다운)
- 위 "3. 알림 mock 전환" 참고. `NotificationsPage`/`NotificationBell`/`NotificationSwipeableListItem` 등 프레젠테이션 컴포넌트는 **수정 불필요**(모두 `useNotifications()`의 동일한 인터페이스만 소비).

## 이슈 #46(`docs/plans/worries-list.md`) 계획과의 관계
그 계획서가 정의한 `fetchOngoingWorries`, `deriveWorryListViews`, `WorryListFilter`/`WorryListView` 등 타입/파생 로직은 전부 **그대로 유지**된다. 이번 전환에서 바뀌는 것은 오직 `fetchOngoingWorries`(그리고 `fetchRecentWorries`)의 **내부 구현**(Supabase 조회 → localStorage 읽기)과 **시그니처의 `userId` 파라미터 제거**뿐이다. 화면 컴포넌트(`WorryCard`, `DecisionSheet`, `DeleteWorryModal` 등)와 오버레이 상태 관리(`useWorriesListData`)는 위 "고민 목록" 절에서 설명한 초기화 지점 한 곳(일시정지 시드 소비) 외에는 손댈 필요가 없다.

## 삭제/정리 대상 요약
- **삭제**: `src/lib/goals.ts`, `supabase/functions/_shared/auth.ts`(더 이상 아무도 import하지 않게 됨 — 안전하게 삭제 가능. 남겨둬도 무해하지만 정리 차원에서 삭제 권장).
- **재작성(파일 유지, 내용 전면 교체)**: `src/lib/worries.ts`, `src/lib/notifications.ts`, `src/lib/worryThumbnails.ts`, `src/contexts/NotificationsContext.tsx`, `src/lib/aiWorryAssistant.ts`(호출 방식만), `supabase/functions/ai-generate-questions/index.ts`/`ai-generate-verdict/index.ts`(인증 제거+rate limit 추가), `supabase/config.toml`(두 함수 `verify_jwt` 값).
- **부분 수정**: `src/App.tsx`(라우팅/Provider), `src/pages/SignupComplete/index.tsx`(goals 호출부만), `src/pages/Home/useHomeData.ts`, `src/pages/Worries/useWorriesListData.ts`, `src/pages/NewWorry/index.tsx`+`useNewWorryFlow.ts`, `src/pages/MyPage/index.tsx`.
- **신규 생성**: `src/lib/localNickname.ts`, `src/contexts/NicknameContext.tsx`, `supabase/functions/_shared/rateLimit.ts`.
- **수정하지 않음(죽은 코드로 그대로 유지)**: `src/lib/supabase.ts`, `src/lib/profiles.ts`, `src/contexts/AuthContext.tsx`, `src/components/auth/ProtectedRoute.tsx`, `src/pages/Login/index.tsx`, `src/pages/SignUp/index.tsx`(goals 호출부 외 `SignupComplete/index.tsx`의 나머지), `src/routes/paths.ts`, `src/utils/nicknameValidation.ts`, `.env`의 두 Supabase 변수.
- **의존성(`package.json`)**: `@supabase/supabase-js`는 **제거하지 않는다**(위 "죽은 코드 처리 방침" 참고 — 죽은 파일들의 빌드를 위해 필요). 기능적으로는 더 이상 살아있는 코드 경로에서 쓰이지 않는다는 점만 유지보수 시 참고.

## 확인 필요 (사용자 승인 시 답변 필요)
그릴링 세션에서 제품/기능 결정은 전부 확정되었다. 다만 계획서를 작성하며 **새로 발견한 기술적 제약 하나**가 있어 아래에 남긴다 — 이번 계획서는 이미 그 제약을 반영한 기본안(위 "죽은 코드 처리 방침")으로 작성했지만, 원한다면 대안으로 바꿀 수 있다.

- [x] **죽은 인증 코드(`AuthContext`/`ProtectedRoute`/`Login`/`SignUp`)와 "`@supabase/supabase-js` 완전 제거" 사이의 상충**: 사용자 승인 완료 — **기본안대로 진행**. 패키지/`supabase.ts`/`profiles.ts`를 죽은 코드 전용으로 그대로 남겨두고, 살아있는 코드(AI 호출)만 `fetch()`로 바꿔 SDK와 무관하게 만든다. 번들러 트리쉐이킹으로 실제 배포 번들에는 영향 없음.

## 작업 순서 제안 (developer 서브에이전트용)
1. **로컬 스토어 모듈 작성**: `src/lib/localNickname.ts`(신규) → `src/contexts/NicknameContext.tsx`(신규) → `src/lib/worries.ts`(재작성, 시드 포함) → `src/lib/notifications.ts`(mock 배열로 재작성) → `src/lib/worryThumbnails.ts`(리사이즈 로직으로 재작성). 이 단계는 순수 로직이라 다른 화면 변경 없이도 독립적으로 작성/검증 가능.
2. **`goals.ts` 삭제 + `SignupComplete` 정리**: `src/lib/goals.ts` 삭제, `SignupComplete/index.tsx`에서 `upsertGoal` 호출부만 제거.
3. **`App.tsx` 라우팅 정리**: `AuthProvider` → `NicknameProvider` 교체, `ProtectedRoute`/로그인/회원가입/가입완료 라우트 제거.
4. **`NotificationsContext.tsx` 재작성**: `useAuth()` 의존 제거, mock 배열 기반 컴포넌트 상태로 전환.
5. **화면별 데이터 소스 교체**: `useHomeData.ts` → `useWorriesListData.ts`(+ 일시정지 시드 소비) → `NewWorryPage/index.tsx`+`useNewWorryFlow.ts` → `MyPage/index.tsx`(로그아웃 UI 제거 포함) 순서로 각각 `useAuth()` 의존을 걷어내고 새 로컬 모듈/Context로 교체.
6. **Edge Function 변경**: `_shared/rateLimit.ts` 신규 작성 → 두 함수에서 `requireAuthenticatedUser` 제거 + rate limit 적용 → `supabase/config.toml`의 `verify_jwt`를 두 함수 모두 `false`로 변경 → `_shared/auth.ts` 삭제.
7. **프론트 AI 호출부 전환**: `src/lib/aiWorryAssistant.ts`를 `fetch()` 기반으로 재작성.
8. **전체 흐름 점검**: 최초 접속(빈 localStorage) 시 홈/고민목록에 시드 데이터(진행 중/일시정지/결정 대기)가 바로 보이는지, 새 고민 생성 전체 플로우(AI 질문→답변→AI 판정→타이머 시작, 로그인 없이)가 정상 동작하는지, 마이페이지 닉네임 수정이 홈 화면에 즉시 반영되는지, 알림 화면 읽음/삭제가 정상 동작하고 새로고침 시 초기화되는지, `/login`·`/signup`·`/signup/complete`로 직접 접근했을 때 라우트가 없어 404(또는 라우터 기본 동작)로 처리되는지 확인. 마지막으로 `npm run build`(`tsc -b && vite build`)와 `npm run lint`을 돌려 죽은 코드(`AuthContext` 등)를 포함해 빌드가 깨지지 않는지 확인.
