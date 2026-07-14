# 홈 화면 - 모바일 반응형 레이아웃 구현 계획

## 개요
- 피그마 링크: https://www.figma.com/design/Tjb8LmHOOZXQMLSL86LSJC/일상뒤집기-디자인?node-id=21-344
- fileKey: `Tjb8LmHOOZXQMLSL86LSJC`, nodeId: `21:344`
- 관련 화면: 홈 화면 (모바일, iPhone 375×812 기준 목업) — **새 화면이 아니라 이미 구현된 홈 화면(`docs/plans/home-screen.md`, 라우트 `/`)의 모바일 반응형 레이아웃을 추가하는 작업**. 이슈 `#4-모바일-화면-구현`에 대응.
- 한 줄 요약: 데스크톱에서는 좌측 사이드바 + 4카드(절약 금액/진행 중인 고민/월별 소비 요약/오늘의 소비 한 줄) 구조였던 홈 화면을, 모바일 폭에서는 상단 바(로고+알림벨) + 인사말 + 3카드(절약 금액/진행 중인 고민/오늘의 소비 한 줄, 월별 소비 요약 카드는 숨김) + 하단 고정 내비게이션 바(+ 중앙 "새 고민 생성" FAB)로 전환한다.

### 피그마 파일 구조 관련 중요 참고사항
- `node-id=21:344`(`Rectangle 6670271`, x=-3040,y=-380, 375×812)는 배경 사각형 노드일 뿐이고, 실제 화면 내용은 같은 캔버스(페이지 `0:1`)에 평면적으로 배치된 형제 레이어들이다(`home-screen.md`의 웹 버전 `89:42`와 동일한 파일 구조 패턴). 이 계획서는 x: -3040~-2665, y: -380~432 범위에 위치한 형제 노드들을 이 모바일 홈 화면의 실제 콘텐츠로 간주해 분석했다.
- **기기 프레임 제외**: `21:346`(iOS 상태바, `System/iOS/StatusBar` 포함 프레임)과 `21:345`(`System/iOS/HomeIndicator`)는 iPhone 목업용 OS 크롬이므로 구현 대상에서 제외한다.
- 같은 파일 안에 동일한 홈 화면의 **웹 버전**(`89:42`, 1920×1080)이 이미 별도로 존재하며 이미 구현되어 `develop`에 머지되어 있다(`docs/plans/home-screen.md` 참고). 이번 모바일 버전은 완전히 새로운 화면이 아니라 **같은 라우트(`/`)의 반응형 레이아웃 분기**로 구현한다.
- Figma 변수(색상/타이포 토큰) 조회 결과 없음(`{}`) — 하드코딩된 hex 값을 그대로 사용한다. 카드 배경/테두리/그림자 등 공통 스타일 값은 웹 버전과 완전히 동일하게 재확인됨(`bg-white border-[rgba(188,230,193,0.55)] rounded-[14px] shadow-[1px_1px_3px_-1px_rgba(0,0,0,0.25)]`, 오늘의 소비 한 줄 카드만 `#f4fbef`).
- 모바일 목업에는 **월별 소비 요약 카드가 없다** (웹 버전에는 있음). 화면 높이(812px) 제약상 의도적으로 뺀 것으로 보이며, 이 node 범위 안에는 해당 카드에 대응하는 레이어가 전혀 없다. 이번 계획은 피그마에 없는 걸 임의로 추가하지 않고, 모바일에서는 이 카드를 숨기는 것으로 계획한다(확인 필요 섹션 참고 없음 — 명확한 피그마 근거 있음).
- 모바일 하단 내비게이션은 데스크톱 사이드바의 5개 항목(홈/새 고민 생성/고민 목록/소비 기록/마이페이지) 중 **"새 고민 생성"이 빠지고 대신 하단 바 중앙에 별도 FAB(+) 버튼**으로 표현된다(4개 탭 + 중앙 FAB). 캔버스의 별도 주석 텍스트(`47:241`, 데스크톱 웹과 공용): "가운데 + 버튼은 새 타이머 생성하기 버튼입니다. 해당 버튼을 누르면 타이머 생성화면으로 이동합니다."

## 전체 레이아웃 (375×812 기준, 프레임 원점 x=-3040,y=-380 기준 상대좌표로 환산, 기기 프레임 제외)
- 상단 바: y 0~93 — 로고(`x=23,y=62, 52×53`) + "멈칫" 워드마크(`x=85,y=76`) / 알림 벨(`x=325.5,y=61, 31×31`)
- 인사말: y 135~171, `x=31` (2줄 텍스트)
- 절약 금액 카드: y 184~289 (`x=11`, 폭 352)
- 진행 중인 고민 카드: y 306~575 (`x=11`, 폭 352) — 내부에 고민 아이템 최대 2개(각 92px 높이, 15px 간격)
- 오늘의 소비 한 줄 카드: y 593~683 (`x=11`, 폭 352)
- (y 683~737 사이 여백)
- 하단 내비게이션 바: y 737~812, 전체 폭 375, 배경 흰색 — 4개 탭 + 중앙 FAB(FAB는 y 714부터 시작해 내비 바 상단 경계를 23px 덮으며 떠 있음)
- 카드 좌우 여백: 프레임 기준 좌 11px / 우 12px (거의 동일, 이번 계획에서는 "좌우 12px 안쪽 여백"으로 취급)
- 상단 바 좌우 여백: 로고 쪽 23px, 벨 쪽 18.5px

## 화면 구성

### 화면 1: 홈 화면 — 모바일 레이아웃 (기존 `/` 라우트의 반응형 분기)
- 라우트: `/` (기존과 동일, 새 라우트 추가 없음)
- 반응형 기준: **커스텀 브레이크포인트 425px**를 기준으로 전환한다(사용자 확정). `tailwind.config`의 `theme.screens.lg` 값을 기본 `1024px`에서 `425px`로 오버라이드해서 사용한다 — 이렇게 하면 아래 계획 전체와 컴포넌트별 실측값 표에 쓰인 `lg:` 프리픽스 표기는 그대로 두고 브레이크포인트 값만 바뀐다. 425px 미만: 이번 계획의 모바일 레이아웃(상단 바 + 하단 내비게이션), 425px 이상: 기존 데스크톱 레이아웃(사이드바) 그대로 유지.
- 이번 작업은 완전히 새로운 페이지/컴포넌트를 만드는 게 아니라, **기존 `AppLayout`과 `Home` 하위 컴포넌트들에 모바일 우선(mobile-first) 반응형 Tailwind 클래스를 추가**하는 방식으로 진행한다. 즉 각 컴포넌트의 기본(prefix 없는) 클래스를 모바일 실측값으로, `lg:` 클래스를 기존에 이미 구현된 데스크톱 값으로 채우는 식이다.

#### 컴포넌트 트리 (■ = 신규, ▲ = 기존 파일 수정, 무표시 = 변경 없음)
- `AppLayout` (`src/components/layout/AppLayout.tsx`) ▲
  - 루트 컨테이너: `flex flex-col lg:flex-row` 로 변경 (모바일: 세로 스택, 데스크톱: 기존 가로 배치 유지)
  - `Sidebar` — 래퍼에 `hidden lg:flex` 추가(모바일에서 숨김). 내부 `BrandLogo`/`SideNav`는 변경 없음
  - `MobileTopBar` (`src/components/layout/MobileTopBar.tsx`) ■ — `flex lg:hidden`
    - `BrandLogo` (재사용, 변경 없음)
    - `NotificationBell` (재사용, 변경 없음)
  - `<Outlet />` → `HomePage`
  - `BottomNav` (`src/components/layout/BottomNav.tsx`) ■ — `lg:hidden`, `fixed bottom-0`
    - `BottomNavItem` (`src/components/layout/BottomNavItem.tsx`) ■ × 4 (홈[end]/소비 기록/고민 목록/마이페이지)
    - `NewWorryFab` (`src/components/layout/NewWorryFab.tsx`) ■ — 중앙 플로팅 버튼, `/worries/new`로 이동
- `HomePage` (`src/pages/Home/index.tsx`) ▲ — 바깥 wrapper 패딩/간격 반응형화(`px-3 py-6 gap-4 lg:px-10 lg:py-16 lg:gap-8`)
  - `HomeHeader` (`src/pages/Home/components/HomeHeader.tsx`) ▲
    - 인사말 텍스트: `text-[15px] lg:text-[30px]`
    - `NotificationBell`: `hidden lg:flex` (모바일에서는 `MobileTopBar`의 벨만 노출, 중복 방지)
  - `ContentGrid` (`src/pages/Home/components/ContentGrid.tsx`) ▲
    - 컨테이너: `flex-col lg:flex-row` (모바일 세로 스택)
    - `SavedAmountCard` ▲, `OngoingWorriesCard` ▲ — 모바일에서도 그대로 노출, 세로로 쌓임
    - `MonthlySummaryCard` 래퍼: `hidden lg:block` (모바일에서 숨김, 피그마 근거는 위 참고사항 참조)
  - `TodayQuoteCard` (`src/pages/Home/components/TodayQuoteCard.tsx`) ▲ — 반응형 폰트/아이콘/패딩

#### 상태/데이터
- 기존 `src/types/home.ts`(`HomeData`, `OngoingWorry`, `CategoryStat`)와 `src/mocks/home.ts`(`homeMock`)를 그대로 재사용한다. 모바일 전용 타입/목데이터 추가 없음.
- `WorryListItem`의 "타이머 늘리기" 버튼 노출 조건(`remainingSeconds <= 3600`)은 기존 로직 그대로 재사용 — 모바일에서 로직 변경 없음, 스타일(폰트/패딩 크기)만 반응형으로 조정.
- 하단 내비게이션의 활성 탭 판정은 기존 `NavItem`과 동일하게 `react-router-dom`의 `NavLink`(`isActive`)로 처리한다.

#### 인터랙션
- 상단 바 알림 벨 클릭 → `/notifications` 이동 (기존 `NotificationBell` 재사용, 데스크톱과 동일)
- 하단 내비게이션 탭(홈/소비 기록/고민 목록/마이페이지) 클릭 → 각 라우트로 이동 (`ROUTES.home`/`ROUTES.records`/`ROUTES.worries`/`ROUTES.mypage`)
- 중앙 FAB(+) 클릭 → `/worries/new`(`ROUTES.newWorry`)로 이동
- "지금까지 절약한 금액" 카드 클릭 → `/records` 이동 (기존 데스크톱과 동일한 `SavedAmountCard`의 `Link` 로직 재사용, 모바일에서도 동일하게 동작)
- "전체 보기" 클릭 → `/worries` 이동 (기존과 동일)
- "타이머 늘리기" 버튼 → 클릭 동작 없음(no-op, 기존 데스크톱과 동일한 확정 사항 유지)

#### 필요 에셋/아이콘 (FAB 아이콘 1개만 사용자 제공 신규 에셋, 나머지는 기존 자산 재사용)

| 위치/용도 | 피그마 node id | 매핑 |
|---|---|---|
| 상단 바 로고 | `25:70` | `src/assets/logo.svg` (기존 `BrandLogo` 컴포넌트 재사용) |
| 상단 바 "멈칫" 워드마크 | `25:72` | 텍스트 그대로 (기존 `BrandLogo` 재사용) |
| 상단 바 알림 벨 | `45:80` | `src/assets/alarm.svg` (기존 `NotificationBell` 컴포넌트 재사용) |
| 절약 금액 카드 일러스트 | `27:97` | `src/assets/pig.svg` (기존 재사용) |
| "전체 보기" 화살표 | `27:108` | lucide-react `ChevronRight` (기존 재사용) |
| 고민 아이템 시간 아이콘 | `31:54`, `32:66` | lucide-react `Clock` (기존 재사용) |
| "타이머 늘리기" 버튼 아이콘 | `32:77` | lucide-react `Plus` (기존 재사용) |
| 오늘의 소비 한 줄 아이콘 | `36:53` | `src/assets/electric_bulb.svg` (기존 재사용) |
| 하단 내비 "홈" 아이콘 | `23:51` | lucide-react `House` (기존 `SideNav`와 동일) |
| 하단 내비 "소비 기록" 아이콘 | `23:54` | `src/assets/report.svg` (기존 재사용) |
| 하단 내비 "고민 목록" 아이콘 | `23:57` | `src/assets/list.svg` (기존 재사용) |
| 하단 내비 "마이페이지" 아이콘 | `23:59` | `src/assets/my-page.svg` (기존 재사용) |
| 중앙 FAB 버튼(배경+아이콘 통합) | `23:43`, `26:85` | 사용자 제공 신규 에셋 `src/assets/fab-plus.svg` 그대로 사용 (별도 배경색/아이콘 스타일 없음) |
| 고민 아이템 썸네일 | `31:46`, `32:65` | 기존 데스크톱과 동일하게 회색 placeholder 박스 유지 (`bg-[#f5f5f5]`, 실사 이미지 없음 — `home-screen.md` "확인 완료" 결정 그대로 승계) |

#### 컴포넌트별 모바일 실측값 (기존 데스크톱 구현값은 `lg:`로 유지, 아래 값을 기본(모바일) 클래스로 추가)

**HomeHeader**
- 인사말 텍스트: `15px` Medium (데스크톱 기존 `text-[30px]` 유지)

**MobileTopBar (신규)**
- 로고 아이콘 52×53, "멈칫" 30px SemiBold — 기존 `BrandLogo`가 이미 이와 근접한 고정 크기(로고 h-12.5 w-12.25=50×49px, 텍스트 29px)로 구현돼 있어 그대로 재사용해도 시각적 차이가 미미함(변경 불필요, 재사용)
- 알림 벨: 기존 `NotificationBell`(36×36px, 데스크톱 코드 주석상 이미 축소 적용됨)을 그대로 재사용 (모바일 실측 31×31px과 근접, 변경 불필요)

**SavedAmountCard**
- 카드 패딩: 모바일은 카드 폭(352px) 대비 여유가 적어 기존 `p-8`(32px)보다 축소 필요 — 정확한 내부 패딩 실측치는 피그마에 explicit하게 없어(카드 자체 배경 레이어와 텍스트 레이어 좌표 차이로 역산) 대략 `p-4`(16px) 권장, 데스크톱은 `lg:p-8` 유지
- 제목 "지금까지 절약한 금액": `17px` Medium (데스크톱 `lg:text-[30px]` 유지)
- 금액: 큰 숫자 `28px` + 단위 `15px` Medium (데스크톱 `lg:text-[50px]` + `lg:text-[20px]` 유지)
- 배지 "이번 달 + N원": `10px` Medium, 색상 `#629f41`(모바일 실측값 — 데스크톱은 기존 `text-black` 유지, `lg:text-black`), 배지 배경 `#eefff0` radius `6px`는 공통
- 부가 텍스트 "포기한 상품 N개 | 구매한 상품 N개": `10px` Medium (데스크톱 `lg:text-[15px]` 유지)
- 돼지 일러스트: 모바일 108×100px (데스크톱 기존 `h-32 w-32`=128×128px 유지, `lg:h-32 lg:w-32`, 모바일은 약 `h-25 w-27`)

**OngoingWorriesCard**
- 카드 패딩: `p-4`(16px) 권장 (데스크톱 `lg:p-8` 유지)
- 제목 "진행 중인 고민": `15px` Semibold (데스크톱 `lg:text-[30px]` 유지)
- "전체 보기": `13px` Semibold (데스크톱 기존 `text-[15px]` → `lg:text-[15px]`로 유지)
- 아이템 간 세로 간격: 모바일 실측 15px ≈ `gap-4`(16px, 기존 데스크톱 `gap-6` 대비 축소)

**WorryListItem**
- 썸네일: 모바일 66×66px — 기존 코드가 이미 `h-16 w-16`(64px)로 구현돼 있어 모바일 값과 거의 일치(변경 불필요). 데스크톱 실제 피그마 값은 104×104px이므로 정확히 하려면 `lg:h-26 lg:w-26`로 키우는 것을 권장(확인 필요 아님, 기존 데스크톱 구현이 이미 승인된 값이라 이번 범위에서 데스크톱 값 자체를 바꿀지는 developer가 임의 판단하지 말고, 이번 계획 범위는 모바일 값 유지 + 데스크톱은 현행 유지가 기본. 데스크톱 크기 조정은 이번 이슈 범위 밖)
- 상품명 "치즈 말랑이": `14px`(=`text-sm`) Medium (데스크톱 기존 `text-base` → `lg:text-base` 유지)
- 가격: `11px` Medium, 색상 `#666` (데스크톱 기존 `text-[15px] text-black` → `lg:text-[15px] lg:text-black` 유지)
- 잔여 시간: `10px` Regular, 색상 `#a9d592` (데스크톱 기존 `text-[13px]` 색상 동일 → `lg:text-[13px]` 유지)
- 진행 바 높이: 모바일 실측 10px(`h-2.5`) (데스크톱 기존 `h-1.75`=7px 유지 → `lg:h-1.75`)
- "타이머 늘리기" 버튼: 배경 `#7ccf8a` radius `6px`(공통), 텍스트 `10px` Semibold 흰색(데스크톱 기존 `text-[13px]` 유지), 버튼 크기 축소(`px-2 py-1`, 데스크톱 `lg:px-3 lg:py-2` 유지), 내부 `Plus` 아이콘 `h-3 w-3`(데스크톱 `lg:h-3.5 lg:w-3.5` 유지)

**TodayQuoteCard**
- 카드 패딩: 모바일 축소 필요(대략 `px-4 py-3`, 데스크톱 `lg:px-8 lg:py-3` 유지), 카드 높이는 고정 높이(`h-41.25`) 대신 모바일에서 `h-auto` 또는 실측(약 90px, `h-22.5`) 권장 → `lg:h-41.25`
- 제목 "오늘의 소비 한 줄": `15px` Semibold (데스크톱 기존 `text-[35px]` → `lg:text-[35px]` 유지)
- 문구 텍스트: 모바일 실측 없음(피그마 카드 폭 안에서 자동 줄바꿈 추정) — 데스크톱 `text-[30px]` 대비 큰 폭으로 축소 필요, 대략 `text-[13px]` 권장(정확한 실측치는 피그마 텍스트 박스가 카드 배경과 겹쳐 정밀 확인 어려움 — 확인 필요)
- 전구 아이콘: 모바일 28×34px (데스크톱 기존 `h-15.5 w-13` 유지 → `lg:h-15.5 lg:w-13`, 모바일은 `h-8.5 w-7`)

**BottomNav / BottomNavItem / NewWorryFab (신규)**
- 내비 바: 전체 폭, 높이 75px(`h-18.75`), 배경 흰색, `position: fixed; bottom: 0`, 상단 보더 `border-t border-[rgba(188,230,193,0.55)]`(카드와 동일 톤, 사용자 확정)
- 탭 아이콘: 30×30px, opacity 60% (사이드바와 동일 패턴)
- 탭 라벨: `9px` Semibold — 비활성 색상 `#666`(사이드바와 동일), 활성("홈") 색상은 사이드바 active 색상 `#729e59`로 통일(사용자 확정, 피그마 저대비 값 `#d7edd2` 미사용)
- 중앙 FAB: `src/assets/fab-plus.svg`를 그대로 배치(사용자 제공 에셋, 별도 배경색/아이콘 조합 스타일링 없음), 지름 약 64px 크기로 표시, 내비 바 상단 경계를 23px 정도 덮으며 떠 있음 (`absolute` 포지셔닝, 내비 바 컨테이너 기준 `top: -23px` 정도)

## 확인 필요 → 사용자 확정 완료
- [x] **반응형 브레이크포인트**: `lg` 값을 `425px`로 오버라이드해서 사용 (사용자 지정).
- [x] **하단 내비 활성 탭 색상**: 사이드바 active 색상 `#729e59`로 통일 (피그마 저대비 값 `#d7edd2` 대신).
- [x] **FAB(+) 배경**: 색상 대신 사용자가 `src/assets/fab-plus.svg` 이미지 에셋을 직접 제공. developer는 별도 배경색 스타일 없이 이 svg를 FAB에 그대로 사용한다(사용자가 파일 추가 예정 — developer는 해당 경로에 파일이 있는지 먼저 확인하고, 없으면 AskUserQuestion으로 재확인).
- [x] **고민 아이템 카드 스타일**: 모바일(`WorryListItem`)에서만 자체 흰 배경 + 둥근 모서리(14px) + 그림자를 추가하는 "카드 안 카드" 스타일 적용. 데스크톱은 기존 단순 행(row) 구조 유지(`lg:` 프리픽스로 배경/그림자 제거).
- [x] **하단 내비 고정 여부**: `position: fixed; bottom: 0`으로 항상 화면 하단에 고정.
- [x] **하단 내비 상단 보더**: 카드와 동일한 톤 `border-t border-[rgba(188,230,193,0.55)]` 적용.
- [x] **TodayQuoteCard 문구 폰트 크기**: `13px` 추정치로 진행. developer 구현 후 reviewer가 스크린샷 비교로 미세 조정.
- [x] **WorryListItem 데스크톱 썸네일 크기(64px vs 피그마 실측 104px)**: 이번 모바일 이슈 범위 밖. 손대지 않고 현행(64px, `lg:h-16 lg:w-16`) 유지.

## 작업 순서 제안 (developer 서브에이전트용)
1. `AppLayout` 반응형 구조로 수정: 루트 컨테이너 `flex-col lg:flex-row`, `Sidebar`에 `hidden lg:flex` 추가.
2. `MobileTopBar` 컴포넌트 신규 작성 (`src/components/layout/MobileTopBar.tsx`): 기존 `BrandLogo` + `NotificationBell` 재사용, `flex lg:hidden`으로 노출.
3. `BottomNav`, `BottomNavItem`, `NewWorryFab` 컴포넌트 신규 작성 (`src/components/layout/`): 기존 `NavItem` 패턴을 참고해 `NavLink` 기반으로 구현, lucide-react `House`/`Plus` + 기존 svg 아이콘(`report.svg`/`list.svg`/`my-page.svg`) 재사용. `AppLayout`에 `lg:hidden`, `fixed bottom-0`으로 삽입.
4. `HomeHeader` 수정: 벨 `hidden lg:flex`, 인사말 텍스트 반응형 크기 적용.
5. `HomePage`, `ContentGrid` 수정: 바깥 패딩/간격 반응형화, `flex-col lg:flex-row`, `MonthlySummaryCard` 래퍼에 `hidden lg:block` 추가.
6. `SavedAmountCard`, `OngoingWorriesCard`, `WorryListItem`, `TodayQuoteCard`에 위 "컴포넌트별 모바일 실측값" 표대로 모바일 기본 클래스 + 기존 데스크톱 값을 `lg:` 프리픽스로 유지하는 반응형 클래스 적용.
7. 모바일 콘텐츠 영역 하단에 `BottomNav`/`NewWorryFab`과 겹치지 않도록 `pb-24 lg:pb-0` 등 여백 보정.
8. `tailwind.config`의 `theme.screens.lg`를 `425px`로 오버라이드. `src/assets/fab-plus.svg` 파일이 실제로 존재하는지 먼저 확인하고(사용자가 추가 예정), 없으면 AskUserQuestion으로 재확인 후 진행.
9. 375px(모바일)/425px(브레이크포인트 경계)/768px/1920px(데스크톱) 등 여러 뷰포트에서 브라우저로 시각 확인.
