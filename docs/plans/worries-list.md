# 고민 목록 (모바일) 구현 계획

## 개요
- 피그마 링크: fileKey `Tjb8LmHOOZXQMLSL86LSJC` (캔버스 `0:1` 안 x≈16451~18264, y≈6856~9401 "고민목록" 클러스터, `499:xxx` 기준)
  - `499:2497`/`499:2496` 섹션 타이틀 "고민목록"
  - `491:767` 고민 목록 - 기본 (진행 중 카드 2개)
  - `499:1291` 고민 목록 · 결정 대기 (필터 선택 상태)
  - `491:839` 고민 목록 - 결정 대기 & 결정 시트 (바텀시트 오버레이 — 499 클러스터엔 없어 여기서만 확인)
  - `499:1359` 고민 목록 · 일시정지
  - `499:1436` 고민 목록 · 삭제 확인 모달
  - `499:1516` 고민 목록 · 빈 목록
  - (`499:2211`은 변경 내역 설명 텍스트 블록이라 구현 대상 아님)
- 관련 화면: `/worries` 단일 라우트 안에서 필터/파생 상태로 갈라지는 리스트 화면 + 그 위에 뜨는 결정 시트·삭제 확인 모달 오버레이 2종. 각 프레임은 390×844 아이폰 목업이며 상태바("9:41")는 기기 프레임 장식이라 구현 대상에서 제외.
- 한 줄 요약: 진행 중/일시정지/결정 대기 3가지 파생 상태를 가진 고민 카드 리스트를 보여주고, 확정(구매/포기)과 일시정지는 실제 DB에는 쓰지 않는 로컬 오버레이 상태로만 처리하는 화면.

## 공통 전제 (모든 하위 화면에 적용)
- **앱 셸**: 이슈 #39 구조를 따른다. `App.tsx`의 `ROUTES.worries`(`/worries`)를 `AppLayout`(`ProtectedRoute` 하위) 안에 등록한다. `AppLayout`이 이미 상단 `MobileTopBar`(로고+알림벨)와 하단 `BottomNav`(+FAB)를 렌더링하므로, 이 화면 자체의 컴포넌트 트리는 그 사이(`<Outlet/>`)에 들어가는 콘텐츠만 다룬다. 피그마 프레임 상단의 "9:41" 상태바만 기기 프레임이고, 그 아래 "고민 목록" 타이틀부터는 실제 콘텐츠다 — `MobileTopBar`는 피그마 이 화면 캡처에는 안 보이지만(캡처 시점에 별도 오버레이로 얹힌 것으로 추정) 기존 페이지들(`RecordsPage` 등)과 동일하게 그 아래 위치한다.
- **컨테이너 컨벤션**: `HomePage`/`RecordsPage`가 이미 쓰는 `flex flex-col gap-4 px-3 pt-6 pb-24` 컨테이너 클래스를 그대로 재사용한다. 피그마 실측(카드 좌우 여백 24px, 프레임 폭 390px 고정)과 기존 구현(좌우 padding 12px, 카드는 `w-full`로 유동)에 이미 차이가 있는데, 이 프로젝트는 기존 두 화면에서 이미 이 컨벤션으로 정착시켰으므로 이번에도 동일하게 따른다(새로 피그마 24px를 재현하지 않음). 카드 폭은 고정 342px가 아니라 컨테이너를 꽉 채우는 `w-full`로 구현한다(어차피 폰 프레임 실제 폭이 390px에 고정되지 않을 수 있어 유동이 맞다).
- **폰트/색상 팔레트**: 이 프로젝트 전역에서 이미 쓰는 색을 그대로 재사용한다.
  - 기본 그린 톤: 진한 초록 버튼/선택 강조 `#3e9b48`, 연한 초록 배경 `#e9f6e4`, 딜리트/경고 레드 `#e05b4e` (기존 `Toast`/`AuthField`/`MyPage`에서 이미 쓰는 확정 팔레트).
  - 위 색은 실제로 스크린샷을 시각 확인해 팔레트가 기존 앱과 동일 계열임을 확인했다(그린 필터칩·CTA·연한 초록 배지가 전부 `#3e9b48`/`#e9f6e4` 계열, 레드 계열 배지/경고가 전부 `#e05b4e` 계열).
- **아이콘**: lucide-react `X`(카드 하단 ✕ 닫기 버튼), `ListTodo`(빈 목록 아이콘, `BottomNav`의 "고민 목록" 탭과 동일 아이콘 재사용). 삭제 확인 모달의 원형 "!" 배지는 피그마 텍스트 레이어가 실제로 느낌표 글리프 하나뿐이라(아이콘 벡터 아님) lucide 아이콘 대신 원형 배지 안에 텍스트 `!`를 그대로 넣는다. 요약 카드 보조문구의 "⏱"/"⏸"는 `HomeHeader`의 "✨ {userName}님," 문구와 동일하게 이모지 글리프를 문자열에 그대로 포함시킨다(이 프로젝트가 장식용 이모지를 아이콘 컴포넌트 대신 문자로 직접 쓰는 기존 전례를 따름).
- **재사용 후보**: `useCountdown`(`src/hooks/useCountdown.ts`)을 카드 카운트다운에 그대로 재사용. `formatWon`/`formatRemainingTime`(`src/utils/format.ts`) 재사용. 카드 자체(`WorryListItem`)는 홈이 "ongoing 전용 최대 2개"라는 제약이 있어 그대로 재사용하지 않고, 이 화면 전용 `WorryCard`를 새로 만든다(카테고리/AI 배지, 상태별 버튼, 결정 대기·일시정지 색 반전 등 홈 카드와 요구사항이 다름).

## 데이터/타입 설계

### `src/lib/worries.ts` 변경
- `WorryRecord`에 `aiVerdict: AiVerdict | null` 필드를 추가한다(현재는 select에 `ai_verdict` 컬럼이 없어 누락돼 있음 — 컬럼은 `docs/plans/new-worry.md`에서 이미 추가돼 있고 `createWorry`가 insert 시점에 채워두므로 select만 추가하면 된다).
- `toWorryRecord`가 `row.ai_verdict`(jsonb, `AiVerdict` 형태 그대로 저장됨)를 `aiVerdict`로 매핑하도록 수정.
- `fetchRecentWorries`의 select 목록에도 `ai_verdict`를 추가해 타입을 일관되게 맞춘다(홈 화면은 이 필드를 쓰지 않지만 있어도 무해함).
- 신규 함수 `fetchOngoingWorries(userId: string): Promise<WorryRecord[]>` 추가: 기간 제한 없이 `status = 'ongoing'`인 row만 조회(`deadline_at` 오름차순 정렬 — 어차피 화면에서 "남은 시간순"으로 다시 정렬하지만 초기 로드 순서를 명확히 하기 위해). `fetchRecentWorries`처럼 select 컬럼에 `ai_verdict` 포함.

### 신규 `src/types/worriesList.ts`
```ts
export type WorryListFilter = 'all' | 'ongoing' | 'paused' | 'pending';

/** status==='ongoing'인 WorryRecord에 로컬 오버레이를 얹어 계산하는 화면 표시용 파생 상태.
 *  'confirmed'는 로컬로 구매/포기 확정된 것 — 리스트에서 완전히 제외되므로 화면엔 노출되지 않지만
 *  파생 계산 중간값으로만 쓰인다. */
export type WorryDerivedStatus = 'ongoing' | 'paused' | 'pending' | 'confirmed';

/** 일시정지 로컬 오버레이. 재개 시 remainingSecondsSnapshot으로 표시용 마감을 다시 계산한다. */
export interface PausedOverlay {
  pausedAt: number; // epoch ms
  remainingSecondsSnapshot: number;
}

/** 확정(구매/포기) 로컬 오버레이. DB에는 쓰지 않고 화면 표시에서만 이 worry를 제외시키는 용도. */
export interface OutcomeOverlay {
  outcome: 'abandoned' | 'purchased';
  decidedAt: number; // epoch ms, 시트 안내문구용
}

/** 삭제 로컬 오버레이. 실제 DB delete가 아니라 화면 표시에서만 제외시키는 용도(id만 있으면 되므로 Set으로 관리). */
export type DeletedWorryIds = Set<string>;

/** WorryCard 등이 바로 쓰는 파생 뷰 모델. */
export interface WorryListView {
  worry: WorryRecord; // id/name/price/category/thumbnailUrl/aiVerdict 등 원본
  status: 'ongoing' | 'paused' | 'pending';
  displayRemainingSeconds: number; // paused면 스냅샷 고정값, 아니면 실시간 계산값
  displayProgressPercent: number;
}
```
- `WORRY_CATEGORIES`(9개, `src/types/newWorry.ts`)는 그대로 재사용. 실제 DB에 저장되는 `category`는 새 고민 생성 화면이 항상 이 9개 중 하나로 저장하므로, 피그마 목업의 "주방"/"리빙" 같은 예시 문구는 실데이터에는 나타나지 않는다 — 별도 매핑 함수 없이 `worry.category`를 그대로 배지에 표시하면 된다("주방"→생활용품, "리빙"→가구·인테리어는 목업 예시를 해석하기 위한 참고일 뿐, 코드로 옮길 매핑 로직이 아님).

### 파생 로직 (신규 `src/lib/worryListDerive.ts` 제안)
- `deriveWorryListViews(worries: WorryRecord[], now: Date, pausedOverlays: Record<string, PausedOverlay>, outcomeOverlays: Record<string, OutcomeOverlay>, deletedIds: DeletedWorryIds): WorryListView[]`
  1. `outcomeOverlays` 또는 `deletedIds`에 있는 id는 결과에서 완전히 제외(확정되었거나 삭제된 고민은 이 화면에 다시 나타나지 않음 — 단, 실제 row는 그대로 남아있어 새로고침하면 다시 나타난다).
  2. 나머지 중 `pausedOverlays`에 있는 id → `status: 'paused'`, `displayRemainingSeconds = remainingSecondsSnapshot`(고정, 틱 없음), `displayProgressPercent`는 그 시점 값으로 고정 계산.
  3. 나머지 중 `now >= worry.deadlineAt` → `status: 'pending'`, `displayRemainingSeconds: 0`, `displayProgressPercent: 100`.
  4. 그 외 → `status: 'ongoing'`, 실시간 `deadlineAt` 기준 잔여 계산(카드 컴포넌트 안에서 `useCountdown`으로 매초 갱신 — 이 함수는 초기 정렬/카운트용 스냅샷만 계산).
- "재개" 액션은 `pausedOverlays`에서 해당 id를 제거하고, **표시용** 새 마감(`now + remainingSecondsSnapshot`)을 어딘가에 들고 있어야 실시간 카운트다운이 이어진다. 실제 `worry.deadlineAt`은 절대 변경하지 않으므로, 재개 시점에 별도의 "표시용 마감 오버라이드" 맵(`Record<string, Date>`, 예: `resumedDisplayDeadlines`)에 `id -> new Date(now + remainingSecondsSnapshot*1000)`을 기록해두고, `WorryCard`는 이 오버라이드가 있으면 그 값을, 없으면 원본 `deadlineAt`을 카운트다운 타깃으로 쓴다.
- 페이지 최상위에서 1초 간격 `setInterval`로 "지금" 상태를 갱신하는 훅(예: `useNowTick()` — 단순히 1초마다 `Date.now()`를 새 상태로 set)을 두고, 이 값을 `deriveWorryListViews`에 넘겨 진행 중 카드가 결정 대기로 자동 전환되는 시점에 필터 칩 개수/요약 카드도 함께 갱신되게 한다(개별 카드 내부의 `useCountdown`은 카드 표시 숫자만, 이 tick은 "카테고리 재분류·칩 개수·요약 문구"를 갱신하는 역할로 책임을 분리).

## 화면 구성

### 화면 1: 고민 목록 — 공통 셸 + 4가지 파생 상태
- 라우트: `/worries`
- 컴포넌트 트리:
  - `WorriesPage` (`src/pages/Worries/index.tsx`)
    - `WorriesHeader` — "고민 목록" 타이틀만 (정렬 드롭다운은 만들지 않음 — 어차피 정렬 기준이 "남은 시간순" 하나뿐이라 트리거 UI 자체가 불필요)
    - `WorrySummaryCard` — 보류 중인 금액 + 필터별 보조문구
    - `WorryFilterChips` — 전체/진행 중/일시정지/결정 대기 4개
    - (분기) `WorryEmptyState` — "전체" 필터가 실제 0건일 때만
    - (분기) 리스트 영역
      - `WorryCard` × N (variant: `ongoing` | `pending` | `paused`)
      - 특정 필터 선택 && 0건이면 `WorryFilterEmptyNotice`(짧은 문구, 리스트 자리에만)
      - `LoadMoreButton` — 현재 필터에서 숨겨진 개수가 있을 때만
  - `DecisionSheet` (오버레이, `isOpen`일 때만 렌더 — 화면 2에서 상세)
  - `DeleteWorryModal` (오버레이, `isOpen`일 때만 렌더 — 화면 3에서 상세)
- 상태/데이터 (`useWorriesListData` 훅 제안):
  - `worries: WorryRecord[]` — `fetchOngoingWorries(user.id)` 결과, 로그인 유저 기준 최초 1회 로드.
  - `pausedOverlays`, `resumedDisplayDeadlines`, `outcomeOverlays`, `deletedIds` — 전부 컴포넌트 상태(`useState`)로만 관리, 새로고침 시 초기화(`docs/adr/0004-...` 그대로, 삭제도 이 범위에 포함).
  - `now` — `useNowTick()`으로 1초마다 갱신.
  - `filter: WorryListFilter` — 기본값 `'all'`, 필터 클릭 시 변경. 필터가 바뀌면 `visibleCount`를 2로 리셋.
  - `visibleCount: number` — 기본 2, "더 보기" 클릭 시 현재 필터 목록의 전체 길이로 확장(페이지네이션 아님 — 이미 전체를 한 번에 조회해두었으므로 "더 보기"는 네트워크 요청 없이 클라이언트에서 숨겨둔 나머지를 한번에 보여주는 동작).
  - `decisionSheetTarget: string | null` — 열려 있는 결정 시트의 worry id.
  - `deleteModalTarget: string | null` — 열려 있는 삭제 확인 모달의 worry id.
  - 파생값: `views = deriveWorryListViews(worries, now, pausedOverlays, outcomeOverlays)`(재개 오버라이드까지 반영), `counts = { all, ongoing, paused, pending }`(각각 `views`에서 필터링한 길이), `filteredViews = views.filter(...).sort(남은시간 오름차순)`, `visibleViews = filteredViews.slice(0, visibleCount)`.
- 인터랙션:
  - 필터 칩 클릭 → `filter` 변경 + `visibleCount` 2로 리셋.
  - 진행 중 카드 "일시정지" 클릭 → 현재 `displayRemainingSeconds`를 스냅샷으로 `pausedOverlays[id] = { pausedAt: now, remainingSecondsSnapshot }` 기록.
  - 일시정지 카드 "타이머 재개" 클릭 → `pausedOverlays`에서 제거, `resumedDisplayDeadlines[id] = now + remainingSecondsSnapshot*1000` 기록.
  - 진행 중/일시정지 카드 "✕" 클릭 → `deleteModalTarget = id` (결정 대기 카드는 이 버튼이 없어 삭제 진입 경로 자체가 없음 — 확정 전 삭제 불가라는 확정된 정책).
  - 결정 대기 카드 "최종 결정하기" 클릭 → `decisionSheetTarget = id`.
  - "더 보기" 클릭 → `visibleCount = filteredViews.length`.
  - FAB(+, `BottomNav`에 이미 존재) → `/worries/new` 이동(기존 컴포넌트 그대로, 이 화면에서 별도 구현 불필요).
- 필요 에셋/아이콘: `X`, `ListTodo`(빈 목록). 썸네일은 사용자가 등록한 이미지(`thumbnailUrl`)가 있으면 표시하고, 없으면 `Home`의 `WorryListItem`과 동일하게 `bg-[#f5f5f5]` 플레이스홀더 박스(피그마의 "PHOTO" 텍스트는 목업 placeholder라 실제로 렌더링하지 않음).
- 반응형 기준: 없음(모바일 고정 뷰포트 전제, `PhoneFrame` 앱 셸 구조 — "웹 반응형" 분기 없음).

#### 실측 스펙 — 헤더/요약/칩 (`491:767`, `499:1291`, `499:1359` 공통 부분 기준)
- 헤더: `고민 목록` 제목은 다른 페이지 제목(`RecordsHeader` "소비 기록" 25px, `MyPage` "프로필 수정" 25px)과 동일한 `text-[25px] font-semibold text-black` 컨벤션을 그대로 따른다. **정렬 드롭다운은 만들지 않는다** — 필터링이 "남은 시간순" 하나로 확정된 이상 정렬 옵션을 고르는 트리거 UI 자체가 불필요하므로 우측에는 아무것도 두지 않는다(피그마 목업엔 있었지만, 클릭해도 아무 동작이 없는 장식용 트리거를 남겨두는 것보다 애초에 없는 게 UI상 더 정확하다는 판단으로 삭제 확정).
- 요약 카드(`Summary`, 342×100 실측 → `w-full`, `rounded-[14px]`, `p-4`, 기존 `SavedAmountCard`류와 동일한 카드 셸): "보류 중인 금액" 라벨(`text-[12px] text-[#666]` 톤) → 총액(`text-[28px] font-semibold text-black` 톤, "원" 접미사 포함) → 구분선(`border-t border-[#eee]`, `mt-4 pt-3`) → 보조문구 한 줄(`text-[12px]`, 좌측 라벨/우측 값 `justify-between`).
  - 보조문구는 **현재 필터**에 따라 갈린다(피그마 3개 상태 확인됨):
    - `all`/`ongoing`: `⏱ 가장 급한 건 · {가장 급한 항목명} · {표시상 남은시간 라벨}` — "가장 급한 항목"은 `ongoing`/`paused`/`pending` 통틀어 `displayRemainingSeconds`가 가장 작은 1건(동률이면 배열 순서상 첫 항목). 그 항목이 `pending`이면 값 칸에 "타이머 종료"(레드), 그 외엔 "N시간 N분 남음"(그린) — 카드에서 쓰는 라벨 매핑 함수를 그대로 재사용.
      - `ongoing` 필터는 피그마에 별도 보조문구가 없어, `all`과 동일한 문구 패턴을 그 필터로 좁혀진 항목 집합에 대해 재사용한다(합리적 기본값 — 별도 문구가 확인된 적 없어 `all`과 같은 톤 유지).
    - `pending`: `⏱ 결정을 기다리는 고민` (좌) / `{count}건` (우, 레드 볼드) — `499:1291` 실측.
    - `paused`: `⏸ 멈춰둔 고민` (좌) / `{count}건` (우) — `499:1359` 실측.
  - 빈 목록(전체 0건)일 땐 이 카드를 숨기지 않고 "0원" + 회색 처리(`499:1516`: `진행 0 · 정지 0 · 대기 0` 한 줄로 축약된 보조문구, 구분선 없이 한 줄 레이아웃) — 화면 4에서 상세.
- 필터 칩 4개(`Chip`, 높이 30 → `h-7.5`, `rounded-full`, 칩 간 `gap-2`): 비선택 = `bg-white border border-[#dedede] text-black`, 선택 = `bg-[#3e9b48] text-white font-semibold`(스크린샷 크롭으로 "결정 대기"/"일시정지" 선택 칩 모두 동일한 그린임을 확인 — 상태별로 칩 색이 달라지지 않는다). 라벨: `전체 {count}` / `진행 중 {count}` / `일시정지 {count}` / `결정 대기 {count}`.

#### 실측 스펙 — 카드 (`ConcernCard`, 342×180 → `w-full`, `rounded-[14px]`, `border`, `bg-white`, `p-4`, 카드 간 `gap-3`)
- 1행: 썸네일(52×52 → `w-13 h-13 rounded-[10px]`) + 카테고리 배지(`h-5 rounded-full px-2 text-[13px]`, 옅은 회녹색 배경/짙은 텍스트) + AI 배지(`h-5 rounded-full px-2 text-[13px] font-medium`) + (일시정지 카드만) 우측 끝 "일시정지" 배지(같은 배지 스타일, 옅은 회색 배경).
  - AI 배지: `aiVerdict.verdict === 'necessary'` → `AI · 합리적`(옅은 초록 `#e9f6e4` 배경, `#3e9b48` 텍스트), `'unnecessary'` → `AI · 충동 신호`(옅은 레드 배경, `#e05b4e` 텍스트). `aiVerdict`가 없는 레코드(과거 데이터 등)는 이 배지를 렌더링하지 않는다(그레이스풀 디그레이드, 별도 확인 불필요).
- 2행: 상품명(`text-[15px] font-semibold text-black`, truncate), 가격(`text-[13px] text-[#666]`, `formatWon` + "원").
- 3행: 카운트다운(`text-[20px] font-bold` tabular-nums, 좌측) + 상태 라벨(우측, `text-[12px]`):
  - `ongoing`: `HH:MM:SS`(블랙) + `남음`(그린 `#3e9b48` 톤).
  - `pending`: `00:00:00`(레드 `#e05b4e`) + `타이머 종료`(레드).
  - `paused`: 스냅샷 고정 `HH:MM:SS`(무채색 회색) + `일시정지됨`(회색).
- 4행: 진행바(`h-1.5 rounded-full bg-[#eee]` 배경 + 진행률 채움) — `ongoing`은 그린(`#3e9b48`) 채움, `pending`은 레드(`#e05b4e`) 채움(항상 100%), `paused`는 무채색 회색 채움(스냅샷 진행률 고정).
- 5행(액션, 높이 42 → `h-10.5`, 버튼 간 `gap-2`):
  - `ongoing`: `일시정지`(outline 버튼, `flex-1`, `border border-[#dedede] bg-white text-black`) + `X`아이콘 버튼(`w-12`, 동일 outline 스타일).
  - `pending`: `최종 결정하기`(전체 폭 1개, `bg-[#3e9b48] text-white font-semibold` — `✕` 없음, 확정 전 삭제 불가).
  - `paused`: `타이머 재개`(outline, `flex-1`) + `X`아이콘 버튼(outline, `w-12`).
- `pending` 카드는 카드 전체 테두리·카운트다운·진행바가 전부 레드 톤으로 바뀐다(`491:839`/`499:1291` 스크린샷 확인: 카드 테두리 자체가 옅은 레드로 보임 — `border-[#e05b4e]/40` 정도의 옅은 레드 보더로 구현).
- `paused` 카드 하단, 리스트 마지막에 안내 카드(342×52 → `w-full rounded-[10px] bg-[#e9f6e4] p-4`, 텍스트 2줄: "멈춰둔 고민은 시간이 흐르지 않아요." / "재개하면 남은 시간부터 다시 카운트됩니다.") — `일시정지` 필터에서만 노출(`499:1359` 실측, 카드 리스트와 "더 보기" 사이가 아니라 카드 리스트 바로 다음/더보기 앞).

#### `LoadMoreButton`
- `342×44 → w-full h-11 rounded-[10px] border border-[#dedede] bg-white text-[14px] font-medium text-black`, 라벨 `더 보기 ({hiddenCount}건 남음)`. `hiddenCount = filteredViews.length - visibleCount`, 0이면 렌더링하지 않음.

### 화면 2: 결정 시트 (바텀시트 오버레이)
- 라우트: 없음 — `/worries` 위에 뜨는 오버레이(`decisionSheetTarget`이 worry id일 때만 렌더).
- 피그마: `491:839`의 `DecisionSheet` 프레임(0,468, 390×392) — 위쪽 절반은 뒤에 깔린 리스트(딤 처리, `bg-black/40` 추정 — 기존 `ConfirmModal`의 딤 배경과 동일 톤 재사용), 아래쪽에서 올라오는 시트.
- 컴포넌트 트리:
  - `DecisionSheet`
    - 그랩 핸들(`w-12 h-1 rounded-full bg-[#dedede]`, 상단 중앙)
    - 타이틀 "24시간이 지났어요"(`text-[20px] font-bold`)
    - 부제 `{name} · {formatWon(price)}원`(`text-[13px] text-[#666]`)
    - `AiSummaryBox`: "AI 진단 요약"(`text-[12px] text-[#666]`) + `필요성 {n}% · 충동성 {n}%`(`text-[16px] font-bold`) + 참고 문구(`aiVerdict.description` 또는 별도 참고 텍스트, `text-[12px] text-[#666]`) — 배경 `bg-[#e9f6e4] rounded-[14px] p-4`.
    - `포기하기 · {formatWon(price)}원 절약` 버튼(`h-13 rounded-[10px] bg-[#3e9b48] text-white font-semibold`, 전체폭)
    - `구매하기` 버튼(`h-13 rounded-[10px] border border-[#dedede] bg-white text-black font-semibold`, 전체폭, 위 버튼과 `gap-2.5`)
    - 하단 안내 문구(`text-[12px] text-[#666]`, 중앙 정렬) — **문구 수정 확정**: 원본 피그마 카피 "선택은 소비 기록에 바로 반영됩니다"는 실제 동작(로컬 상태만 반영, 소비 기록/DB 미반영)과 맞지 않아 **"선택 결과가 이 목록에 반영됩니다"** 로 교체(소비 기록 언급 제거).
- 상태/데이터: 없음(부모 `useWorriesListData`의 콜백만 props로 받음) — `worry: WorryRecord`, `onAbandon: () => void`, `onPurchase: () => void`, `onDismiss: () => void`.
- 인터랙션:
  - "포기하기" 클릭 → `outcomeOverlays[id] = { outcome: 'abandoned', decidedAt: now }` 기록 + 시트 닫힘 → 카드가 리스트/칩 개수/요약 카드에서 즉시 사라짐.
  - "구매하기" 클릭 → `outcomeOverlays[id] = { outcome: 'purchased', decidedAt: now }` 기록 + 시트 닫힘 → 동일하게 사라짐.
  - 그랩 핸들 드래그 또는 바깥(딤 영역) 클릭으로 닫기 → 아무 오버레이도 기록하지 않고 `decisionSheetTarget = null`만 변경. 카드는 여전히 `pending` 상태로 남아 리스트에 그대로 유지된다(확정된 정책: 결정 없이 닫으면 결정 대기 유지).
  - 그랩 핸들 실제 드래그 제스처까지는 과할 수 있어, 최소 구현은 그랩 핸들/딤 배경 클릭 시 닫히는 것으로 충분(스와이프 제스처는 있으면 좋지만 필수 아님 — 피그마엔 별도 애니메이션 스펙이 없음).
- 필요 아이콘: 없음(텍스트 전용).
- 반응형 기준: 없음(모바일 고정).

### 화면 3: 삭제 확인 모달
- 라우트: 없음 — `/worries` 위에 뜨는 오버레이(`deleteModalTarget`이 worry id일 때만 렌더).
- 피그마: `499:1436`의 `DeleteModal` 프레임(310×272, 화면 중앙).
- 컴포넌트 트리:
  - `DeleteWorryModal`
    - 원형 배지(`w-14 h-14 rounded-full bg-[#fbe4e1]` 톤, 안에 `!` 텍스트 `text-[#e05b4e] font-bold text-[24px]`)
    - 타이틀 "이 고민을 삭제할까요?"(`text-[18px] font-bold`)
    - 본문 — **문구 수정 확정**(결정 시트 카피 수정과 동일한 이유): 원본 피그마 카피 "…삭제한 고민은 소비 기록에도 남지 않아요"는 실제로는 로컬 오버레이일 뿐이라(새로고침하면 다시 나타남) 맞지 않아, `{name}의 타이머와 AI 분석 기록이 이 목록에서 사라집니다.`로 교체(소비 기록 언급 제거)(`text-[13px] text-[#666]`, 2~3줄)
    - 버튼 2개(각 `flex-1 h-12 rounded-[10px]`, `gap-2`): `취소`(outline, `border border-[#dedede] bg-white text-black`) / `삭제`(filled, `bg-[#e05b4e] text-white font-semibold`)
- 기존 `src/components/ConfirmModal.tsx`는 재사용하지 않는다 — 이 모달은 시각 스펙(아이콘 배지, 2버튼 색상 대비, 카드 크기 310×272)이 전용 알림 삭제용 `ConfirmModal`(260×100, 예/아니요 텍스트 버튼만)과 크게 달라 신규 컴포넌트로 만든다.
- 상태/데이터: `worryName: string`, `onCancel: () => void`, `onConfirmDelete: () => void` props만.
- 인터랙션:
  - "취소" 또는 바깥(딤) 클릭 → 모달 닫기만(`deleteModalTarget = null`), 카드는 그대로 유지.
  - "삭제" 클릭 → **확정된 결정**: 실제 DB delete가 아니라 확정/일시정지와 동일하게 **로컬 오버레이로만 화면에서 제외**한다(`deletedIds: Set<string>` 로컬 상태에 id 추가 → `deriveWorryListViews`가 `outcomeOverlays`와 동일하게 이 id를 결과에서 제외). 실제 `worries` row는 삭제되지 않으므로 새로고침하면 다시 나타난다. 근거는 `ADR-0004`를 확장해 "삭제"도 로컬 전용 범위에 포함시킨다(아래 참고).
- 필요 아이콘: 없음(텍스트 `!`).
- 반응형 기준: 없음(모바일 고정).

### 화면 4: 빈 목록
- 라우트: `/worries` (필터 `all`이고 `worries` 전체가 0건일 때만 이 전체 화면으로 교체).
- 피그마: `499:1516`.
- 컴포넌트 트리:
  - `WorryEmptyState`
    - `WorriesHeader`(동일하게 유지)
    - `WorrySummaryCard`(0원, 회색 처리 — 위 "실측 스펙" 문단의 빈 목록 변형)
    - `WorryFilterChips`(4개 칩 전부 0)
    - 아이콘 원(`w-16 h-16 rounded-full bg-[#e9f6e4]`, 안에 `ListTodo` 아이콘)
    - 타이틀 "아직 고민이 없어요"(`text-[18px] font-bold`)
    - 안내문 "사고 싶은 물건을 등록하면 AI가 5가지 질문으로 진단해 드려요."(`text-[13px] text-[#666]`, 중앙 정렬 2줄)
    - CTA 버튼 "+ 새 고민 생성"(`h-12.5 w-45 rounded-[10px] bg-[#3e9b48] text-white font-semibold`, `/worries/new`로 이동)
    - 힌트 카드(`w-full rounded-[14px] bg-[#e9f6e4] p-4`): "이렇게 쓰면 좋아요"(`text-[12px] font-semibold`) + "장바구니에 담기 전 여기에 먼저 등록해 보세요. 24시간 뒤에 다시 물어봐 드립니다."(`text-[12px] text-[#666]`)
- 특정 필터(전체가 아닌)를 선택했는데 그 필터가 0건인 경우는 이 화면 전체를 쓰지 않는다 — `WorryFilterEmptyNotice`(리스트 자리에만 들어가는 짧은 문구, `OngoingWorriesCard`의 "등록된 고민이 없어요"와 동일한 스타일: `text-[15px] font-medium text-[#666]`, 카드/아이콘 없음)를 대신 렌더링한다. 필터별 문구 제안: `ongoing` → "진행 중인 고민이 없어요", `paused` → "일시정지된 고민이 없어요", `pending` → "결정 대기 중인 고민이 없어요" (피그마에 정확한 카피가 없어 기존 톤에 맞춰 제안 — 발견 즉시 바꿀 수 있는 사소한 카피라 별도 확인 없이 이대로 구현).
- 필요 아이콘: `ListTodo`.
- 반응형 기준: 없음(모바일 고정).

## 확인 필요 (사용자 승인 시 답변 필요)
- 없음 — 그릴링 세션에서 데이터 소스, 목록 범위/파생 상태 정의, 카테고리 매핑, 정렬, AI 배지 매핑, 라우팅, 컴포넌트 재사용 방침, 삭제 동작 범위까지 전부 확정되어 이 문서에 반영했다.

## 작업 순서 제안 (developer 서브에이전트용)
1. **라우트 등록**: `App.tsx`의 `AppLayout` 하위(`ProtectedRoute` 안)에 `ROUTES.worries` 라우트 + `WorriesPage` 연결.
2. **`src/lib/worries.ts` 확장**: `WorryRecord`에 `aiVerdict` 추가, `toWorryRecord`/`fetchRecentWorries` select 보정, `fetchOngoingWorries` 신규 함수 추가.
3. **타입/파생 로직**: `src/types/worriesList.ts`(필터/오버레이/파생뷰 타입) + `src/lib/worryListDerive.ts`(`deriveWorryListViews` 등 순수 함수, 유닛 테스트하기 쉬운 형태로) 작성.
4. **`useWorriesListData` 훅**: 데이터 로드 + 로컬 오버레이 3종(`pausedOverlays`/`resumedDisplayDeadlines`/`outcomeOverlays`) + 필터/visibleCount/모달 타깃 상태 + 파생값 계산까지 한 훅에 모아 `WorriesPage`가 얇게 유지되도록.
5. **카드 이하 프레젠테이션 컴포넌트**: `WorriesHeader` → `WorrySummaryCard` → `WorryFilterChips` → `WorryCard`(3 variant) → `LoadMoreButton` 순으로, 각 컴포넌트를 만들 때마다 실측 스펙 문단 기준으로 스타일 확정.
6. **오버레이**: `DecisionSheet`, `DeleteWorryModal` 구현(둘 다 `WorriesPage`에서 조건부 렌더). 삭제는 `deletedIds` 로컬 오버레이로만 처리(실제 delete 호출 없음).
7. **빈 상태 2종**: `WorryEmptyState`(전체 0건 풀스크린) / `WorryFilterEmptyNotice`(특정 필터 0건, 인라인 문구).
8. **마무리**: 데이터 없음/로딩/에러 상태는 `HomePage`/`RecordsPage`가 쓰는 것과 동일한 패턴("불러오는 중...", 에러 문구)으로 맞추고, 전체 흐름 리뷰(필터 전환, 일시정지→재개, 결정 시트 포기/구매, 삭제, 더 보기, 빈 목록 진입) 수동 점검.
