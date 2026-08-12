<!--
planner 서브에이전트 작성. 이번 건은 피그마 기반이 아니라 레퍼런스 웹사이트(구조만 참고) +
기존 코드베이스 리팩터링 계획이라 TEMPLATE.md의 "화면 구성" 포맷 대신 구조 리팩터링에 맞게
섹션을 재구성했다.
-->

# 랜딩 + 폰 목업 구조 리팩터링 계획 (이슈 #39)

## 개요
- 근거: 피그마 아님. 레퍼런스 사이트 https://ansoka.netlify.app/ ("안속아" AI 사기판독기)의
  **레이아웃 구조만** 참고 — 좌측 서비스 설명 패널 + 우측 스마트폰 프레임 안에서 프로토타입이
  동작하는 "핏치 겸 데모" 구성.
- 브랜치: `39-refactor-프로토타입-형식에-맞춰-리팩터링` (developer가 checkout, 이 문서는 코드 미수정)
- 한 줄 요약: 현재 웹/모바일 반응형 공존 구조를 버리고, `/`(그리고 사실상 모든 라우트)를
  "왼쪽 서비스 소개 패널 + 오른쪽 폰 프레임(그 안에서 기존 앱이 react-router로 실제 동작)"
  구조로 전환하고, 기존 5개 화면의 웹 전용 반응형 레이아웃을 전부 제거해 모바일 레이아웃만 남긴다.
- 색/카피 원칙: 레퍼런스의 보라색 브랜드·카피·카드 디테일은 베끼지 않는다. 우리 기존 브랜드 색
  (그린 계열, 코드에 이미 쓰이는 `#4fb75b`/`#3e9b48`/`#e9f6e4` 등)과 서비스명 "멈칫"(코드에 이미
  쓰이는 실제 인앱 브랜드명, `BrandPanel.tsx`/`Login`/`SignUp` 참고)을 그대로 쓰고, 레퍼런스에서
  차용하는 건 오직 "좌측 설명 패널 + 우측 폰 프레임" 배치 구조뿐이다. 카피 문구는 전부 placeholder.

---

## 1. 레퍼런스 사이트 구조 조사 결과

`WebFetch`로 조사(HTML→텍스트 변환 기반이라 정확한 px/CSS 값까지는 확인 불가, 구조적 패턴 위주로 확인).

- **전체 구성**: 좌측 서비스 설명 패널 + 우측 인터랙티브 스마트폰 프레임의 2단 레이아웃. "오른쪽
  화면을 직접 눌러보세요"라는 안내 문구가 있는 것으로 보아 폰 영역이 실제 클릭 가능한 데모임.
- **폰 프레임**: 상단에 `9:41 / 신호 / 배터리` 형태의 iOS 스타일 상태바가 폰 프레임 장식으로
  함께 그려져 있음(즉 레퍼런스는 폰 프레임 자체를 "장식용 상태바 포함 CSS 프레임"으로 만들었다는
  뜻). 정확한 베젤 두께/radius/그림자 수치는 HTML 텍스트 추출로는 확인 불가 — 다만 이런 류의
  폰목업은 이미지 에셋 없이 `div` + `border`(베젤) + `rounded-[]`(모서리, 보통 40~55px대) +
  `box-shadow`(입체감)만으로 구현 가능한 게 일반적인 패턴이고, 우리도 동일하게 순수 CSS로
  구현하면 된다(신규 이미지 에셋 불필요).
- **좌측 설명 패널 섹션 순서** (텍스트 추출 기준):
  1. 로고/배지 ("🛡안속아", "AI 사기판독기 · 프로토타입")
  2. 헤드라인 ("이거 사기인가? 고민하는 3분을 3초로.")
  3. 서브카피 (문제 제기 + 해결 방식 설명, 2~3문장)
  4. 핵심 통계/체크리스트 3개 (예: "3초 — 판독에 걸리는 시간", "문장 단위 — 왜 위험한지 근거
     제시", "가족 연동 — 부모님 폰까지 지킴")
  5. 피처 카드 4개 (아이콘 + 제목 + 1~2문장 설명씩)
  6. 하단 안내 박스 ("오른쪽 화면을 직접 눌러보세요" + 데모 사용법 힌트)
- **폰 안 콘텐츠 성격**: 레퍼런스는 "가족 탭", "판독 사례 ④번" 같은 표현으로 볼 때 **정적으로
  미리 구성해둔 시나리오형 데모**(고정 스크린샷/슬라이드 또는 아주 얕은 탭 전환)에 가깝다.
  **우리는 이와 다르게 진짜 react-router 앱 전체(로그인부터 마이페이지까지)가 그 안에서
  실제로 동작해야 한다** — 이 차이가 이번 리팩터링의 기술적 핵심이다(3장 참고).
- **좁은 화면에서의 반응형 동작**: WebFetch(텍스트 변환 도구)로는 실제 CSS 미디어 쿼리를 확인할
  수 없어 정확한 스택 순서/폰 숨김 여부까지는 단정할 수 없다. 일반적으로 이런 2단 랜딩 구조는
  좁은 화면에서 세로 스택(설명 패널 위 → 폰 아래, 또는 그 반대)으로 전환되는 경우가 많다는 것만
  참고용으로 확인했고, 우리 프로젝트에서 어떤 방식을 택할지는 "확인 필요" 섹션에 옵션으로 정리했다.

---

## 2. 현재 코드베이스 조사 결과

### 2-1. 라우트 (`src/routes/paths.ts`, 변경 없음)
`/`(home), `/login`, `/signup`, `/signup/complete`, `/worries/new`, `/worries`, `/records`,
`/mypage`, `/notifications`

### 2-2. 현재 라우팅 트리 (`src/App.tsx`)
```
<Routes>
  <Route path="/login" element={<LoginPage />} />
  <Route path="/signup" element={<SignUpPage />} />
  <Route element={<ProtectedRoute />}>
    <Route element={<AppLayout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/worries/new" element={<NewWorryPage />} />
      <Route path="/mypage" element={<MyPage />} />
    </Route>
    <Route path="/notifications" element={<NotificationsPage />} />       {/* AppLayout 밖 */}
    <Route path="/signup/complete" element={<SignupCompletePage />} />    {/* AppLayout 밖 */}
  </Route>
</Routes>
```
`/notifications`, `/signup/complete`는 이미 지금도 "AppLayout(사이드바/상단바/하단바) 밖의
독립 풀스크린 라우트"로 구현돼 있다(로그인/회원가입과 동일 패턴). 이번 리팩터링에서도 이
구조(=AppLayout 유무)는 그대로 유지하고, 그 바깥에 한 겹 더(Landing 레이아웃 라우트)를 씌운다.

### 2-3. 레이아웃 컴포넌트 현황 (실사용처 확인 완료)
- **`AppLayout.tsx`**: `Sidebar`(데스크톱, `lg:flex`로 426px+에서만 노출) + `MobileTopBar`
  (모바일, `lg:hidden`) + `BottomNav`(모바일, `lg:hidden`)를 함께 렌더링하고 `lg:` 기준으로
  서로 배타적으로 보이게 하는 구조.
- **`Sidebar.tsx`/`SideNav.tsx`**: `Sidebar`는 `hidden ... lg:flex`로 **데스크톱 전용 확정**.
  내부에 로고/네비게이션(`SideNav`)/로그아웃 버튼을 담고 있고, 모바일에는 대응하는 컴포넌트가
  없다(모바일은 `MobileTopBar`+`BottomNav`+`MyPage` 페이지 내부의 별도 로그아웃 버튼으로 대체돼
  있음). → **삭제 대상**(모바일 전용 구조가 되면 이 컴포넌트들을 마운트할 지점 자체가 없어짐).
- **`MobileTopBar.tsx`/`BottomNav.tsx`**: 각각 `lg:hidden`으로 **모바일 전용 확정**. 리팩터링
  후에도 그대로 유지(단, `lg:hidden` modifier는 제거 — 항상 보이면 됨). `BottomNav`는
  `fixed inset-x-0 bottom-0`으로 **브라우저 뷰포트 기준 고정**돼 있다 → 폰 프레임 안에서는
  프레임의 스크린 영역 기준으로 붙어야 하므로 **`fixed` → `absolute`로 전환 필요**(3-6 참고,
  단순 브레이크포인트 제거만으로 끝나지 않는 항목).

### 2-4. 완전 분리형 vs 점진형 두 가지 반응형 패턴
23개 대상 파일을 확인한 결과 두 가지 패턴으로 나뉜다.

**(a) 완전 분리형** — 모바일 블록(`lg:hidden`)과 데스크톱 블록(`hidden lg:flex`)이 JSX 자체가
통째로 두 벌로 나뉘어 있는 파일. 이 경우 **데스크톱 블록 JSX를 통째로 삭제**하고, 모바일 블록의
`lg:hidden`만 제거하면 된다(내부 마크업/클래스는 손댈 필요 없음).
- `Login/index.tsx`, `SignUp/index.tsx`, `SignupComplete/index.tsx`, `MyPage/index.tsx`
- 대표 예시(`Login/index.tsx`):
  ```tsx
  {/* 모바일 레이아웃 (< 426px, ...) */}
  <div className="flex flex-col px-6 pt-18 font-noto lg:hidden">   {/* lg:hidden 만 제거 */}
    ...
  </div>

  {/* 데스크톱 레이아웃 (426px 이상, 기존 구현 그대로) */}
  <div className="hidden min-h-screen lg:flex">   {/* 이 블록 통째로 삭제 */}
    <BrandPanel />
    ...
  </div>
  ```
  이 패턴에서 데스크톱 블록에서만 쓰이던 `BrandPanel` import도 함께 제거된다(→ `BrandPanel.tsx`
  자체가 다른 사용처 없이 unused가 됨, 3-6 참고).

**(b) 점진형** — 하나의 마크업에 `lg:`/`xl:` 수식어로 크기/간격/레이아웃 값만 덧붙인 파일. 이
경우 **`lg:`/`xl:`/`2xl:` 수식어가 붙은 클래스만 제거**하고 base(모바일 기준값)만 남기면 된다.
- `AppLayout.tsx`, `BottomNav.tsx`, `MobileTopBar.tsx`, `Home/index.tsx`,
  `Home/components/{ContentGrid,HomeHeader,OngoingWorriesCard,SavedAmountCard,TodayQuoteCard,WorryListItem}.tsx`,
  `NewWorry/index.tsx`, `NewWorry/components/{AiLoadingScreen,CategoryDropdown,ProductInfoStep,QuestionStep,TimerStartedStep,VerdictResultStep,WizardStepper}.tsx`
- 대표 예시(`Home/components/WorryListItem.tsx`):
  ```tsx
  // Before
  className="flex flex-wrap items-center gap-4 rounded-[14px] border border-gray-100 bg-white p-3
    shadow-[0px_0px_-4px_-1px_rgba(0,0,0,0.25)] lg:gap-2 lg:p-2 xl:flex-nowrap xl:gap-4
    xl:rounded-none xl:border-0 xl:bg-transparent xl:p-0 xl:shadow-none"
  // After
  className="flex flex-wrap items-center gap-4 rounded-[14px] border border-gray-100 bg-white p-3
    shadow-[0px_0px_-4px_-1px_rgba(0,0,0,0.25)]"
  ```
  `ContentGrid.tsx`는 `xl:flex-row` 등 **레이아웃 분기 자체**를 담고 있어(데스크톱 2컬럼 vs
  모바일 세로 스택 + `MonthlySummaryCard` 숨김), `xl:` 분기를 걷어내면 항상 모바일 세로 스택
  구조만 남는다 → `MonthlySummaryCard`가 렌더링될 경로가 완전히 사라진다(3-6 참고).
- `Notifications/index.tsx`는 CSS 반응형 클래스는 없지만, **JS 레벨 반응형 로직**이 있다:
  `useEffect` + `matchMedia('(min-width: 426px)')`로 426px 이상 폭에서 이 라우트에 접근하면
  `/`(홈)로 강제 리다이렉트하는 코드. 이건 "웹은 이 화면 대신 드롭다운을 쓴다"는 옛 구조를
  전제한 로직이라 **CSS 클래스가 아니라 이 리다이렉트 `useEffect` 블록 자체를 통째로 삭제**해야
  한다(폰 프레임이 항상 고정된 좁은 폭이므로 이 분기가 더 이상 의미 없음).

### 2-5. `min-h-screen` → 폰 프레임 기준 재정의 필요
아래 파일들은 `min-h-screen`(브라우저 뷰포트 기준)을 쓰고 있는데, 리팩터링 후에는 이 페이지들이
브라우저 전체가 아니라 **폰 프레임의 고정 크기 스크린 영역 안**에서 렌더링된다. `min-h-screen`을
그대로 두면 실제 브라우저 뷰포트 높이만큼 늘어나 폰 프레임 밖으로 넘치므로, 폰 프레임의 스크린
컨테이너 기준 `h-full`(또는 `min-h-full`)로 바꿔야 한다.
- `AppLayout.tsx` (`min-h-screen flex-col` → `h-full flex-col`)
- `Notifications/index.tsx` (`min-h-screen flex-col bg-white` → `h-full flex-col bg-white`)
- `SignupComplete/index.tsx` 모바일 블록 (`min-h-screen flex-col items-center ...` → `h-full ...`)
- `ProtectedRoute.tsx` 로딩 상태 (`min-h-screen items-center justify-center` → `h-full ...`)
- (`Login`/`SignUp`의 `min-h-screen`은 데스크톱 블록에만 있어 그 블록 삭제로 자연히 사라짐)

### 2-6. `fixed` → 폰 프레임 기준 `absolute` 전환 필요
`fixed`는 브라우저 뷰포트 기준으로 붙기 때문에, 폰 프레임 안에서 쓰면 프레임 밖(브라우저 전체
폭/높이)에 걸쳐 렌더링되는 버그가 난다. PhoneFrame의 스크린 컨테이너에 `relative overflow-hidden`
포지셔닝 컨텍스트를 만들고, 아래 컴포넌트들은 `fixed` → `absolute`로 바꿔 그 컨테이너 기준으로
붙게 해야 한다.
- `BottomNav.tsx` (`fixed inset-x-0 bottom-0` → `absolute inset-x-0 bottom-0`)
- `Toast.tsx` (`fixed inset-x-0 top-6` → `absolute inset-x-0 top-6`)
- `ConfirmModal.tsx` (`fixed inset-0` → `absolute inset-0`)
- `LogoutConfirmModal.tsx`도 같은 패턴이지만, 이 컴포넌트는 `Sidebar` 전용이라 3-6에 따라
  `Sidebar`와 함께 삭제 대상 후보(사용처가 없어지면 이 전환 자체가 불필요해짐)

---

## 3. 새 구조 설계

### 3-1. 라우팅 구조 제안 (레이아웃 라우트 + `Outlet`)

기존 `App.tsx`의 라우트 트리는 **경로(path) 변경 없이** 그대로 유지하고, 최상위에 path 없는
레이아웃 라우트를 한 겹 더 씌운다. react-router는 `path` 없는 `<Route element={...}>`는 URL
세그먼트를 소비하지 않고 그냥 부모 레이아웃으로만 동작하므로, 기존 라우트 경로(`/`, `/login` 등)는
전혀 바뀌지 않는다.

```tsx
// src/App.tsx (신규 트리 제안)
<Routes>
  <Route element={<LandingLayout />}>{/* 신규: 좌측 패널 + 우측 PhoneFrame(Outlet) */}
    <Route path={ROUTES.login} element={<LoginPage />} />
    <Route path={ROUTES.signup} element={<SignUpPage />} />
    <Route element={<ProtectedRoute />}>
      <Route element={<AppLayout />}>
        <Route path={ROUTES.home} element={<HomePage />} />
        <Route path={ROUTES.newWorry} element={<NewWorryPage />} />
        <Route path={ROUTES.mypage} element={<MyPage />} />
      </Route>
      <Route path={ROUTES.notifications} element={<NotificationsPage />} />
      <Route path={ROUTES.signupComplete} element={<SignupCompletePage />} />
    </Route>
  </Route>
</Routes>
```

이렇게 하면 자연스럽게 다음이 성립한다.
- `/`(비로그인 상태)로 처음 들어와도 `ProtectedRoute`가 기존과 동일하게 `/login`으로 리다이렉트
  하고, 그 결과 폰 프레임 안에는 로그인 화면이 뜬다(= 사용자가 로그인부터 폰 안에서 실제로 함).
- `/login`, `/worries/new` 등으로 직접 URL 진입해도 항상 `LandingLayout`을 거치므로 좌측 패널
  +폰 프레임 구조가 동일하게 유지된다(Option A 기준, 3-3 참고).
- `AppLayout`(모바일 상단바/하단바)과 로그인/알림/가입완료 같은 "AppLayout 밖 독립 풀스크린"
  구분은 기존 그대로 유지된다 — 다만 그 "풀스크린"의 기준이 이제 브라우저 전체가 아니라
  PhoneFrame의 스크린 영역이 된다.

### 3-2. 컴포넌트 트리 제안

```
src/pages/Landing/
  index.tsx                  # LandingLayout: PitchPanel(조건부) + PhoneFrame > <Outlet/>
  components/
    PitchPanel.tsx            # 좌측 설명 패널 (배지/헤드라인/서브카피/통계 3개/피처카드 3개/안내박스)
    FeatureCard.tsx           # 피처 카드 1개 단위 (아이콘 + 제목 + 설명), PitchPanel에서 map
src/components/layout/
  PhoneFrame.tsx              # 폰 베젤 + 스크린 영역(순수 CSS), children(Outlet)을 감싸는 재사용 컴포넌트
  AppLayout.tsx                # 기존 유지, Sidebar 관련 코드만 제거
  BottomNav.tsx / MobileTopBar.tsx  # 기존 유지, lg: 제거 + BottomNav는 fixed→absolute
  (Sidebar.tsx, SideNav.tsx 삭제 대상 — 3-6 참고)
```

`PhoneFrame`을 `src/pages/Landing/components/`가 아니라 `src/components/layout/`에 두는 이유:
디렉토리 컨벤션상 특정 화면 전용이 아니라 "앱 전체를 감싸는 셸"의 일부이고, `AppLayout`과
같은 레이어에서 함께 관리하는 게 자연스럽다.

### 3-3. 좌측 설명 패널 노출 범위 — Option A(권장) vs Option B

레퍼런스 사이트는 단일 정적 페이지라 이 문제가 아예 없지만(패널이 항상 그 자리에 있음), 우리는
로그인/위저드 등 여러 화면을 오가야 하므로 "패널을 계속 보여줄지"를 정해야 한다.

- **Option A (권장)**: `LandingLayout`이 모든 라우트에서 좌측 패널을 유지한다. 즉
  `/login`, `/worries/new` 등 어떤 URL이든 항상 "좌측 설명 + 우측 폰 프레임(그 안에 해당 화면)"
  구조로 보인다. 구현이 단순(라우트 위치와 무관하게 `LandingLayout` 하나로 항상 동일하게 렌더)
  하고, 레퍼런스의 "핏치와 데모가 공존" 취지에 가장 가깝다.
- **Option B**: `/`(홈)에서만 좌측 패널을 보여주고, 그 외 라우트는 폰 프레임만 화면 중앙에
  크게 띄운다(좌측 패널은 숨김/축소). "일단 핏치를 보여주고, 사용자가 실제로 눌러서 딥링크
  화면으로 들어가면 데모에 몰입시킨다"는 의도로는 자연스럽지만, `LandingLayout` 안에
  `useLocation()`으로 분기하는 코드가 추가되고, 다른 화면에서 처음 화면(핏치)으로 돌아가는
  경로(예: 좌측 패널의 로고 클릭 → `/` 이동)가 별도로 필요해진다.

두 옵션 모두 `LandingLayout` 컴포넌트 하나 안에서 조건 분기로 구현 가능한 수준이라, 최종 결정은
"확인 필요"에서 받고 그 값대로 구현하면 된다.

### 3-4. `PhoneFrame` 컴포넌트 스펙

- **크기**: 기존 모바일 계획 문서들의 피그마 실측 프레임 폭이 375px(홈)~390px(로그인/회원가입/
  가입완료)로 두 종류였고, 레이아웃 자체는 모두 %/flex 기반이라 375~390 사이에서 깨지지 않는다.
  더 큰 쪽인 **390×844**(로그인/회원가입/가입완료 프레임과 동일 비율, iPhone 12~14 계열 실측과도
  유사)를 스크린 내부 콘텐츠 기준 크기로 채택한다. Tailwind 스케일로 정확히 떨어짐:
  `w-97.5`(390px) / `h-211`(844px) — 임의값 대괄호 문법 불필요.
- **베젤**: 이미지 에셋 없이 순수 CSS로 구현. 바깥 `div`에 두꺼운 `border`(베젤 두께, 예:
  `border-[14px] border-black`) + 큰 `rounded-[52px]`(모서리) + `shadow-2xl`류 그림자로 입체감.
  펀치홀 카메라는 상단 중앙에 작은 `rounded-full bg-black` 도트 하나로 장식(선택 사항, 없어도
  무방 — 확인 필요 항목).
- **스크린 영역**: 베젤 안쪽 `div`에 `relative overflow-y-auto overflow-x-hidden rounded-[40px]
  bg-white`(내부 라운드는 베젤 라운드보다 살짝 작게)로 실제 앱이 렌더링되는 스크롤 컨테이너를
  만든다. 여기가 `AppLayout`/`BottomNav`/`Toast`/`ConfirmModal` 등이 `absolute`로 기준 삼는
  `relative` 포지셔닝 컨텍스트가 된다(2-6 참고).
- **콘텐츠**: `<PhoneFrame><Outlet /></PhoneFrame>` 형태로 스크린 영역 안에 `Outlet`을 렌더링해
  실제 앱 라우트가 그대로 표시되게 한다(정적 이미지 아님 — 레퍼런스와의 핵심 차이).

### 3-5. `PitchPanel` 섹션 구성 (레이아웃 구조만 레퍼런스 참고, 카피/색은 우리 것)

레퍼런스의 섹션 개수/순서를 그대로 참고하되, 우리 서비스("멈칫") 기준 placeholder 카피로 채운다.
1. 로고 + 배지 (`logo.svg` 재사용 + "멈칫 프로토타입" 류 배지)
2. 헤드라인 (예: "충동구매 앞에서, 잠깐 멈춰보세요." — 최종 문구는 확인 필요)
3. 서브카피 (1~2문장, 서비스 한 줄 설명)
4. 핵심 통계/체크리스트 3개 (레퍼런스처럼 숫자/키워드 + 짧은 설명 조합. 실제 값은 홈 화면에서
   이미 쓰는 "누적 절약액" 같은 지표를 재활용할지, 순수 placeholder로 채울지는 확인 필요)
5. 피처 카드 3개 (레퍼런스는 4개지만, 우리 서비스의 핵심 기능은 3개로 정리 가능: ① AI 질문으로
   충동구매 점검 ② 24시간 타이머로 숙려 기간 확보 ③ 절약 기록·리포트로 소비 습관 관리 — 정확한
   문구는 placeholder)
6. 하단 안내 박스 (예: "오른쪽 화면을 직접 눌러보세요. 로그인부터 새 고민 등록까지 실제로
   동작합니다." 류 안내 — 우리 앱은 정적 데모가 아니라 실제 라우팅이라는 걸 알려주는 문구)

아이콘은 전부 `lucide-react`에서 가져온다(레퍼런스는 이모지를 쓰지만 우리는 프로젝트 관례상
lucide 아이콘 사용). 예: 헤드라인 배지 `Sparkles`, 피처 카드는 `Clock`(타이머)/`MessageCircleQuestion`
(AI 질문)/`PiggyBank`(절약 기록) 등 — 정확한 아이콘 매핑은 developer가 의미에 맞게 선택.

### 3-6. 부수 정리 대상 컴포넌트 (조건부 삭제 — 전부 확인 필요)

리팩터링으로 렌더링 경로 자체가 사라지는 컴포넌트들. "5개 화면 리팩터링"의 직접 대상은 아니지만
그 결과로 자연히 unused가 되므로 정리 여부를 정해야 한다.

| 컴포넌트 | 현재 유일한 사용처 | 리팩터링 후 상태 |
|---|---|---|
| `Sidebar.tsx` / `SideNav.tsx` | `AppLayout.tsx`(`lg:flex`, 데스크톱 전용) | 마운트 지점 사라짐 → 삭제 대상 |
| `BrandPanel.tsx` | `Login`/`SignUp` 데스크톱 블록 | 두 사용처 모두 삭제 → 삭제 대상 |
| `LogoutConfirmModal.tsx` | `Sidebar.tsx` | `Sidebar` 삭제 시 함께 unused → 삭제 대상 |
| `MonthlySummaryCard.tsx` / `CategoryStatRow.tsx` | `ContentGrid.tsx`의 `xl:` 분기(모바일엔 원래 없던 카드) | `xl:` 분기 제거 시 렌더 경로 사라짐 → 삭제 대상 |
| `NotificationBell`의 `variant="dropdown"` + `NotificationsPanel.tsx` | `HomeHeader.tsx`의 `hidden lg:flex` 데스크톱 벨 | 그 블록 삭제 시 dropdown variant 자체가 unused → `variant` prop을 없애고 항상 `page` 동작만 남기는 것 검토(삭제 대상 후보) |

---

## 4. 확인 필요 (사용자 승인 시 답변 필요)

- [ ] **좌측 설명 패널 노출 범위**: Option A(모든 라우트에서 항상 유지, 권장) vs Option B
      (`/`에서만 노출, 다른 라우트는 폰 프레임만 중앙에 크게) — 3-3 참고.
- [ ] **랜딩 페이지 자체의 좁은 화면 반응형**: 이 사이트를 모바일 브라우저로 열었을 때
      (a) 설명 패널을 폰 프레임 위/아래로 세로 스택 (b) 설명 패널을 숨기고 폰 프레임만 노출
      (c) 그 외 방식 — 레퍼런스 사이트의 정확한 CSS 미디어쿼리까지는 조사 도구 한계로 확인하지
      못해(1장 참고) 최종 방식은 사용자 확인이 필요.
- [ ] **PitchPanel 카피 톤**: 서비스명은 "멈칫"(기존 인앱 브랜드명) 그대로 사용할지, 완전히
      다른 placeholder 문구로 채울지. 헤드라인/서브카피/피처 카드 3개/통계 3개의 구체적 문구도
      사용자가 나중에 직접 교체할 예정이므로 3-5에 제시한 초안 그대로 진행해도 되는지.
- [ ] **PhoneFrame 상단 상태바 장식 여부**: 레퍼런스처럼 `9:41`류 가짜 상태바(시계/신호/배터리)를
      프레임 장식으로 넣을지, 아니면 CLAUDE.md의 "기기 프레임 제외" 원칙을 존중해 베젤/모서리만
      장식하고 상태바는 넣지 않을지.
- [ ] **PhoneFrame 고정 크기**: 390×844(3-4 제안) 확정 여부, 또는 다른 기준값 사용 여부.
- [ ] **`Sidebar.tsx`/`SideNav.tsx` 삭제 여부** (3-6): 사용처가 없어지는 것은 확인했으나, 실제
      파일 삭제까지 진행할지 최종 확인.
- [ ] **부수 삭제 대상 컴포넌트 삭제 여부** (3-6): `BrandPanel.tsx`, `LogoutConfirmModal.tsx`,
      `MonthlySummaryCard.tsx`/`CategoryStatRow.tsx`, `NotificationBell`의 `dropdown` variant +
      `NotificationsPanel.tsx`.

---

## 5. 작업 순서 제안 (developer 서브에이전트용)

1. `src/components/layout/PhoneFrame.tsx` 신규 작성(순수 CSS 베젤 + 스크린 스크롤 컨테이너).
2. `src/pages/Landing/index.tsx` + `components/PitchPanel.tsx` + `components/FeatureCard.tsx`
   신규 작성 (3-2, 3-5).
3. `src/App.tsx`에 `LandingLayout` 레이아웃 라우트를 최상위에 추가(3-1). 라우트 path는 변경 없음.
4. `AppLayout.tsx`에서 `Sidebar` 제거, `lg:` 분기 제거, `min-h-screen` → `h-full`.
5. `BottomNav.tsx`/`MobileTopBar.tsx`에서 `lg:hidden` 제거, `BottomNav`는 `fixed` → `absolute`.
6. 완전 분리형 파일(`Login`/`SignUp`/`SignupComplete`/`MyPage`)에서 데스크톱 블록 삭제 + 모바일
   블록의 `lg:hidden` 제거, `min-h-screen`(남은 곳) → `h-full`.
7. 점진형 파일(Home 계열/NewWorry 계열)에서 `lg:`/`xl:`/`2xl:` 수식어 클래스 제거.
8. `Notifications/index.tsx`의 `matchMedia` 리다이렉트 `useEffect` 삭제, `min-h-screen` →
   `h-full`.
9. `Toast.tsx`/`ConfirmModal.tsx`를 `fixed` → `absolute`로 전환.
10. "확인 필요"에서 삭제가 확정된 컴포넌트들(`Sidebar`/`SideNav`/`BrandPanel`/
    `LogoutConfirmModal`/`MonthlySummaryCard`/`CategoryStatRow`/`NotificationBell` dropdown
    variant/`NotificationsPanel`) 정리.
11. 여러 라우트(`/`, `/login`, `/worries/new`, `/mypage`, `/notifications` 등)를 브라우저에서
    직접 URL 진입 + 폰 프레임 내부 링크 클릭 양쪽으로 확인, 폰 프레임 스크롤/하단 내비/토스트/
    모달이 프레임 밖으로 새지 않는지(2-6) 점검.
