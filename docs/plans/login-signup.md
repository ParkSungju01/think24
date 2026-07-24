# 로그인 / 회원가입 웹 페이지 구현 계획

## 개요
- 이슈: #21 `[feat] 로그인/회원가입 웹 페이지 구현`
- 브랜치: `21-feat-로그인-회원가입-웹-페이지-구현`
- 피그마 링크: `https://www.figma.com/design/Tjb8LmHOOZXQMLSL86LSJC/?node-id=182-171`(로그인), `...?node-id=182-233`(회원가입), `...?node-id=182-327`(가입 완료·목표 설정)
- fileKey: `Tjb8LmHOOZXQMLSL86LSJC`
- 관련 화면/노드:
  - 로그인 화면 `182:171` ("Web / 01 로그인")
  - 로그인 기능 명세 `182:692` ("명세 / 로그인")
  - 회원가입 화면 `182:233` ("Web / 02 회원가입")
  - 회원가입 기능 명세 `182:650` ("명세 / 회원가입")
  - 가입 완료·목표 설정 화면 `182:327` ("Web / 03 가입 완료 · 목표 설정")
  - 가입 완료·목표 설정 기능 명세 `182:712` ("명세 / 목표 설정")
- **[구현 중 범위 변경]** 회원가입 화면의 "2-3 이메일 인증코드"(6자리 OTP 발송/검증) 단계는 사용자 결정으로 **이번 구현에서 제외**한다. 회원가입은 닉네임/이메일 중복확인/비밀번호(+확인)만으로 진행한다. 화면 2 섹션에 취소선으로 표시했다.
- 범위: 기존 임시 로그인/회원가입 화면(`src/pages/Login/index.tsx`, `src/pages/SignUp/index.tsx`)을 이 피그마 디자인 기반 UI로 **전면 교체**하고, 회원가입 성공 후 이동하는 "가입 완료·목표 설정" 화면을 신규 라우트로 추가한다. 백엔드 연동 방식은 사용자 승인 답변에 따라 아래처럼 확정됐다:
  - 이메일 중복확인/인증코드(OTP)/로그인 5회 실패 제한/닉네임 저장/로그인 상태유지: Supabase가 기본 제공하는 기능(회원가입·로그인·`resetPasswordForEmail`)은 실연동하고, Supabase에 없는 기능(사전 이메일 중복확인, 6자리 OTP 발송/검증, 실패 횟수 카운터)은 이번 범위에서 mock 처리한다.
  - 약관 동의 UI: 피그마 디자인에 없으므로 이번 범위에서 **생략**한다(체크박스/문구 추가 없음, 가입하기 버튼 활성 조건에서 제외).
  - 좁은 화면(1024px 미만): 좌측 BrandPanel을 숨기고 폼만 전체 폭으로 표시한다.
  - 가입 완료 후 이동: 별도 "가입 완료" 화면 대신 **가입 완료·목표 설정 화면**(`182:327`)으로 이동한다(아래 화면 3 참고). 목표 저장 백엔드 테이블은 아직 없으므로, 위 백엔드 범위 원칙과 동일하게 이번 범위에서는 UI만 만들고 목표 값은 실제 저장 없이(mock) 홈으로 이동시키는 것으로 제안한다 — developer 단계 시작 전 최종 확인.
- 범위 밖: App(모바일 네이티브)의 3단계 스텝 회원가입 플로우(명세 2-5 마지막 항목, Web 범위 아님 — 참고만), 마이페이지 > 절약 목표 설정 화면(마이페이지 자체가 아직 없음).
- 한 줄 요약: 좌측 고정 폭 브랜드 패널(로고/카피/절약액 StatCard) + 우측 유동 폭 폼 패널로 구성된 로그인/회원가입 화면과, 가입 완료 후 절약 목표를 설정하는 카드형 화면을, 명세서에 정의된 모든 검증·에러 문구·타이머 인터랙션과 함께 구현한다.

## 현재 상태 파악 (참고)
- `src/pages/Login/index.tsx`, `src/pages/SignUp/index.tsx`는 피그마 없이 만들어진 임시 UI(이메일/비밀번호 입력만 있는 단순 폼, "피그마 디자인 없음" 주석 존재)다. 이번 작업의 목적은 이 임시 UI를 아래 디자인으로 완전히 대체하는 것이다.
- `src/contexts/AuthContext.tsx`는 Supabase Auth 기반이며 `signUp(email, password)`, `signIn(email, password)`, `signOut()`만 제공한다. 아래 기능은 전부 **미구현**이다:
  - 이메일 중복 확인 API
  - 이메일 인증코드(OTP) 발송/검증/재전송/만료 처리
  - 비밀번호 재설정(이메일 발송/재설정 링크) 플로우
  - 로그인 실패 횟수 카운트 및 5회 초과 시 10분 제한
  - 닉네임 저장(현재 별도 프로필 테이블 없음, `auth.users` 메타데이터만 존재)
  - "로그인 상태 유지" 커스텀 Refresh Token 저장(현재는 supabase-js 기본 세션 저장 방식만 사용)
- `src/routes/paths.ts`에 `ROUTES.login = '/login'`, `ROUTES.signup = '/signup'`이 이미 있다. 이번 작업에서 라우트 추가는 필요 없다.
- `docs/plans/backend-setup.md`는 Supabase 초기 설정과 `worries` 테이블 스키마를 다루며, 로그인/회원가입 화면 자체는 "임시 UI로 지금 만든다"는 결정만 남기고 상세 설계는 없다. 세션 유지는 supabase-js 기본 옵션(`persistSession: true`, `autoRefreshToken: true`, localStorage)을 그대로 쓰는 것으로 확정돼 있는데, 이번 명세의 "로그인 상태 유지(httpOnly 쿠키 + Refresh Token 14일)"는 이 기존 결정과 결이 다르다 — 아래 "확인 필요" 참고.
- 이 프로젝트의 Tailwind 브레이크포인트는 표준값이 아니다. `src/index.css`에서 `docs/plans/home-screen-mobile.md` 확정 사항에 따라 `--breakpoint-lg: 426px`, `--breakpoint-xl: 1024px`로 재정의되어 있고, 홈 화면은 `xl`(1024px)을 사이드바 등 구조 전환의 기준점으로 쓴다. 이번 계획의 반응형 임계값도 프로젝트 전체 일관성을 위해 이 `xl`(1024px) 기준을 재사용한다(아래 "전체 레이아웃" 참고).
- 전역 폰트는 `body`에 시스템 산세리프 폴백 스택(`-apple-system, "Apple SD Gothic Neo", "Malgun Gothic", ...`)이 적용돼 있다. 홈 화면 피그마는 `Inter`(한글 글리프 없음)라서 시스템 폰트로 폴백했지만, 이번 로그인/회원가입 피그마는 `Noto Sans KR`(Bold/Medium/Regular, 한글 지원 웹폰트)을 명시적으로 지정하고 있어 홈 화면과 상황이 다르다 — 아래 "확인 필요" 참고.
- `mcp__claude_ai_Figma__get_variable_defs`로 두 화면 모두 조회한 결과 등록된 디자인 변수는 없다(`{}`) — 아래 hex 값을 하드코딩된 값 그대로 사용한다.
- `src/assets/logo.svg`가 이미 존재하며, 홈 화면 사이드바 로고(`docs/plans/home-screen.md`에서 노드 `89:43`에 매핑 확인됨)와 이번 로그인/회원가입 화면의 로고 이미지(`image 140`/`image 141`, "쇼핑백+시계+체크" 아이콘)가 동일한 브랜드 마크이므로 재사용한다.

## 전체 레이아웃 / 반응형 원칙
- 두 화면 모두 피그마 캔버스 기준 1440px 폭(좌측 BrandPanel 560px + 우측 FormPanel 880px)으로 그려져 있다. 이 폭에 고정하지 않고 유동형으로 구현한다.
- **BrandPanel은 1024px 이상 뷰포트에서 560px 고정 폭을 유지한다** (Tailwind `xl:` 유틸리티, 위 "현재 상태 파악"의 브레이크포인트 컨벤션과 동일 기준점 재사용). 1024px 미만에서는 BrandPanel을 숨기고 FormPanel이 뷰포트 전체 폭을 차지하도록 제안한다.
  - 이 화면들에 대한 별도 모바일 피그마 프레임이 제공되지 않았기 때문에, 이 fallback은 "일단 폼만 보여준다"는 최소 대응이다. 실제로 이렇게 처리해도 되는지, 아니면 모바일 전용 로그인/회원가입 디자인이 (홈 화면처럼 `home-screen-mobile.md`가 별도로 있듯) 추후 제공될 예정인지는 **확인 필요**.
- FormPanel: 유동 폭. 내부 폼 콘텐츠 자체는 피그마 기준 폭(로그인 400px, 회원가입 440px)을 최대 폭으로 두고 좌우 여백으로 중앙 정렬하며, 뷰포트가 그보다 좁아지면 폼 콘텐츠도 유동적으로 줄어들되 좌우 최소 padding(16~24px)은 확보한다.
- 세로 방향은 피그마의 고정 프레임 높이(로그인 900px / 회원가입 1024px)를 그대로 쓰지 않고 `min-h-screen` 구조로 콘텐츠 높이에 맞춰 자연스럽게 늘어나게 하며, 뷰포트보다 콘텐츠가 길면(특히 필드가 많은 회원가입) 세로 스크롤을 허용한다.
- 회원가입 화면의 Copy 영역 상단 여백(top 385.5px)이 로그인(top 323.5px)보다 큰 것은 SignupForm의 필드 수가 많아 프레임 전체 높이(1024px vs 900px)가 늘어난 결과로 보인다. BrandPanel 자체의 내부 구조(로고 → 카피 → StatCard → 카피라이트)는 두 화면에서 동일하므로, 반응형 구현에서는 별도 높이 스케일링 없이 하나의 공용 컴포넌트로 재사용하고 `flex flex-col justify-between`(또는 유사 방식)으로 세로 배치를 처리한다.
- 피그마상 각 화면을 감싸는 "Web / 01 로그인", "Web / 02 회원가입" 프레임 자체는 배경(`bg-white`)만 가진 컨테이너이며, 그 안의 `BrandPanel`/`FormPanel` 두 자식이 실제 구현 대상이다.
- **주의 (구현 제외 대상)**: 두 화면 노드 모두에 원형 숫자 배지(로그인: `1-1`~`1-6`, 회원가입: `2-1`~`2-5`)가 절대 좌표로 겹쳐 그려져 있다. 이는 기능 명세(`182:692`, `182:650`)의 각 항목을 화면 위치와 연결하기 위한 **주석용 오버레이**이며 실제 UI 요소가 아니다. 컴포넌트 트리/화면 구성에서 제외한다 (이 계획서에서는 각 인터랙션 항목 번호로만 참조).

## 공통 컴포넌트

### BrandPanel (로그인/회원가입 공용, 신규 `src/components/auth/BrandPanel.tsx` 제안)
- 컴포넌트 트리:
  - `BrandPanel` (폭 560px 고정, 배경 `#e9f6e4`)
    - `Logo` (`src/assets/logo.svg` + "멈칫" 워드마크, Noto Sans KR Bold 50px, `#1f2420`)
    - `Copy`
      - 헤드라인 2줄: "잠시 멈추면" / "더 좋은 선택이 보입니다." (Bold 30px, `#1f2420`, line-height 42px)
      - 서브카피 2줄: "구매 전 잠깐의 멈춤이" / "당신의 절약 습관을 만들어 갑니다." (Regular 15px, `#899086`, line-height 24px)
    - `StatCard` (흰 배경, radius 16px)
      - 라벨 "멈칫 유저들이 지금까지 아낀 금액" (Medium 13px, `#899086`)
      - 금액 "111,111,111원" (Bold 30px, `#3e9b48`)
      - `Badge` "▲ 이번 달 + 11,000원" (배경 `#dff3d8`, radius 20px, 텍스트 Medium 12px `#3e9b48`)
    - `Copyright` "© 2026 Meomchit. All rights reserved." (Regular 12px, `#899086`)
- 상태/데이터: `totalSavedAmount`, `monthlySavedAmount` — 홈 화면의 "지금까지 절약한 금액" 개념과 동일선상이다. `docs/plans/backend-setup.md`는 이 값(`totalSavedAmount`)의 정확한 집계 정의를 "보류" 상태로 남겨뒀다. 로그인/회원가입은 로그인 **전** 화면이라 특정 사용자 값이 아니라 서비스 전체 집계로 보이는데, 실제 집계와 연동할지 정적 값을 하드코딩할지는 확인 필요(우선 제안: 정적 더미 값 "111,111,111원" / "+11,000원" 하드코딩).
- 인터랙션: 없음 (정적 마케팅 패널, 클릭 동작 없음)
- 필요 에셋: `src/assets/logo.svg` (기존 자산 재사용)

### 공통 텍스트 입력 필드 스타일
- 기본: 배경 `#fafbf8`, 테두리 `1px solid #e7eae4`, radius `12px`, 입력 텍스트 Regular 15px `#1f2420`, placeholder `#adb3a9`
- 라벨: Medium 14px `#1f2420`. 필수 항목은 라벨 옆에 빨간 `*`(`#e05b4e`) — **회원가입 화면 필드에만 존재**, 로그인 화면 라벨(이메일/비밀번호)에는 `*` 없음(피그마 원본 그대로).
- 에러 상태: 테두리 `#e05b4e` + 입력창 하단 빨간 텍스트(`#e05b4e`)
- 성공 상태(예: 비밀번호 확인 일치, 이메일 사용 가능): 입력창 하단 초록 텍스트(`#3e9b48`)
- 안내 텍스트(에러/성공 아님, 예: 비밀번호 자릿수 안내): Regular 12px `#899086`

## 화면 구성

### 화면 1: 로그인
- 라우트: `/login` (기존 `ROUTES.login`, 변경 없음)
- 대체 대상: `src/pages/Login/index.tsx`의 기존 임시 UI(이메일/비밀번호만 있는 단순 폼)를 이 디자인으로 전면 교체한다.
- 컴포넌트 트리:
  - `LoginPage` (`src/pages/Login/index.tsx`)
    - `BrandPanel` (공용, 위 참고)
    - `FormPanel` (유동 폭)
      - `LoginForm` (최대 폭 400px)
        - `Heading` ("로그인" Bold 26px `#1f2420` + "다시 만나서 반가워요. 오늘도 현명한 소비 하세요!" Regular 14px `#899086`)
        - `EmailField` (라벨 "이메일", placeholder "example@meomchit.com", 에러 텍스트 슬롯)
        - `PasswordField` (라벨 "비밀번호", placeholder "비밀번호를 입력해 주세요", 우측 눈 아이콘 토글, 에러 텍스트 슬롯)
        - `Options`
          - `KeepLoginCheckbox` ("로그인 상태 유지" — 체크 시 배경 `#4fb75b` + 흰 체크마크, radius 6px)
          - `ForgotPasswordLink` ("비밀번호를 잊으셨나요?", Medium 14px `#3e9b48`)
        - `SubmitButton` ("로그인" — 활성 `#4fb75b`/비활성 `#e7eae4`, radius 12px, 로딩 스피너 상태 포함)
        - `SignupLink` ("아직 회원이 아니신가요? 회원가입" → `/signup`)

- 상태/데이터:
  - `email: string`, `password: string`
  - `emailError: string | null` — blur 시 정규식 검증 결과
  - `passwordVisible: boolean` — 눈 아이콘 토글 상태
  - `keepLoggedIn: boolean`
  - `isSubmitting: boolean` — 로딩 스피너 표시 + 버튼 disable
  - `submitError: string | null` — 로그인 실패/제한 메시지
  - `failedAttemptCount` — 5회 실패 제한 판단용 (저장 위치는 확인 필요)
  - 버튼 활성 조건: `emailError === null && email.length > 0 && password.length > 0` (이메일 형식 유효 + 비밀번호 1자 이상)

- 인터랙션 (기능 명세 `182:692` 전문 반영, 문구는 그대로 사용):
  - **1-1 이메일 입력**: RFC 이메일 정규식으로 형식 검증하며, 포커스 아웃(blur) 시 실시간 검사한다. 형식이 올바르지 않으면 입력창 하단에 빨간 텍스트로 "이메일 형식이 올바르지 않습니다."를 표시하고 테두리를 `#E05B4E`로 바꾼다. 자동 로그인 설정이 되어 있으면 최근 로그인 이메일을 자동 완성한다.
  - **1-2 비밀번호 입력**: 기본적으로 마스킹(●) 처리되며, 우측 눈 아이콘 탭 시 표시/숨김을 토글한다. 붙여넣기는 허용하고, 공백 문자 입력은 차단한다.
  - **1-3 로그인 버튼**: 활성 조건은 이메일 형식 유효 + 비밀번호 1자 이상 입력. 비활성 시 배경은 회색(`#E7EAE4`), 활성 시 브랜드 그린(`#4FB75B`)이다. 클릭 시 로딩 스피너를 표시하고, 중복 클릭 방지를 위해 버튼을 disabled 처리한다. 로그인 실패 응답 시 "이메일 또는 비밀번호가 일치하지 않습니다."를 표시하며(이메일/비밀번호 중 무엇이 틀렸는지는 구분해 노출하지 않음 — 계정 존재 여부 노출 금지), 5회 이상 실패하면 "5회 이상 실패하여 10분간 로그인이 제한됩니다."를 표시한다.
  - **1-4 자동 로그인 / 로그인 상태 유지**: 체크 시 Refresh Token(14일 유효)을 안전한 저장소(Web은 httpOnly 쿠키, App은 Keychain/Keystore)에 저장한다. Web에서는 공용 PC 사용 시 주의를 안내하는 툴팁을 제공한다.
  - **1-5 비밀번호 찾기**: "비밀번호를 잊으셨나요?" 링크 클릭 시 이메일 입력 화면으로 이동하고, 재설정 링크를 발송한다(유효시간 30분). 발송 성공/실패 여부와 무관하게 "메일이 발송되었습니다"라는 동일한 안내를 보여줘 계정 탐색(이메일 존재 여부 추측)을 방지한다.
  - **1-6 회원가입 이동**: 하단 "회원가입" 텍스트 링크 클릭 시 회원가입 화면으로 이동한다. 이때 로그인 화면에 입력했던 값은 유지하지 않는다.

- 필요 에셋/아이콘:
  - `src/assets/logo.svg` (BrandPanel, 기존 자산 재사용)
  - lucide-react `Eye` / `EyeOff` — 비밀번호 표시/숨김 토글. 피그마에는 "👁" 이모지 글리프로 표기돼 있으나 실제 구현은 이모지 문자가 아닌 아이콘 컴포넌트 사용을 제안 (확인 필요)
  - 체크박스 체크마크: 피그마에는 텍스트 "✓" 글리프로 표기. lucide-react `Check` 아이콘 또는 텍스트 글리프 그대로 — 시각적 차이가 거의 없어 구현 재량으로 제안
  - 로딩 스피너: 현재 프로젝트에 스피너 컴포넌트가 없다. 피그마에도 로딩 상태의 구체적인 비주얼이 없으므로 신규 구현 필요 (확인 필요)

- 반응형 기준: 위 "전체 레이아웃 / 반응형 원칙" 참고. `xl:`(1024px) 이상에서 BrandPanel 560px 고정 노출, 미만에서 BrandPanel 숨김 + FormPanel 전체 폭.

### 화면 2: 회원가입
- 라우트: `/signup` (기존 `ROUTES.signup`, 변경 없음)
- 대체 대상: `src/pages/SignUp/index.tsx`의 기존 임시 UI(이메일/비밀번호만 있는 단순 폼)를 이 디자인으로 전면 교체한다.
- 컴포넌트 트리:
  - `SignUpPage` (`src/pages/SignUp/index.tsx`)
    - `BrandPanel` (공용, 위 참고 — 로그인 화면과 동일 컴포넌트 재사용)
    - `FormPanel` (유동 폭)
      - `SignUpForm` (최대 폭 440px)
        - `Heading` ("회원가입" Bold 26px `#1f2420` + "1분이면 충분해요. 멈칫과 함께 절약을 시작해 보세요." Regular 14px `#899086`)
        - `NicknameField` (라벨 "닉네임 *", placeholder "2~10자, 한글/영문/숫자", 에러 텍스트 슬롯)
        - `EmailField` (라벨 "이메일 *", placeholder "example@meomchit.com" + 우측 `DuplicateCheckButton`("중복 확인", 배경 `#e9f6e4`, 텍스트 `#3e9b48`) + 상태 텍스트 슬롯)
        - ~~`EmailCodeField`~~ **(사용자 결정으로 제외 — 아래 참고)**
        - `PasswordField` (라벨 "비밀번호 *", placeholder "8~20자, 영문/숫자/특수문자 조합" + 하단 안내 문구 "ⓘ 영문 대소문자, 숫자, 특수문자를 포함해 8자 이상 입력해 주세요.")
        - `PasswordConfirmField` (라벨 "비밀번호 확인 *", placeholder "비밀번호를 한 번 더 입력해 주세요" + 하단 상태 문구("✓ 비밀번호가 일치합니다." 녹색 또는 불일치 시 빨간 안내))
        - `SubmitButton` ("가입하기", 배경 `#4fb75b`, radius 12px)
        - `LoginLink` ("이미 계정이 있으신가요? 로그인" → `/login`)

- 상태/데이터:
  - `nickname: string`, `nicknameError: string | null`
  - `email: string`, `emailCheckStatus: 'idle' | 'checking' | 'available' | 'duplicate' | 'invalid'`
  - `password: string`, `passwordConfirm: string`, `passwordStrengthMessage: string | null`, `passwordsMatch: boolean | null`
  - `isSubmitting: boolean`
  - `submitError: string | null`
  - 가입하기 버튼 활성 조건: 닉네임/이메일/비밀번호/비밀번호 확인 모두 유효 + `emailCheckStatus === 'available'` (이메일 인증코드 조건 제외 — 아래 참고. 약관 동의는 이번 범위에서 생략)

- 인터랙션 (기능 명세 `182:650` 전문 반영, 문구는 그대로 사용):
  - **2-1 닉네임**: 2~10자, 한글/영문/숫자만 허용(특수문자·공백 불가). 금칙어(욕설/운영자 사칭 등)를 필터링하며, 위반 시 "사용할 수 없는 닉네임입니다."를 표시한다. 서비스 내 닉네임 중복은 허용한다(사용자 식별은 이메일 기준).
  - **2-2 이메일 + 중복 확인**: 이메일 형식 검증을 통과해야 `[중복 확인]` 버튼이 활성화된다. 사용 가능하면 "사용 가능한 이메일입니다."(녹색)를, 이미 가입된 이메일이면 "이미 가입된 이메일입니다. 로그인하시겠어요?" + 로그인 링크를 표시한다. 중복 확인 완료 후 이메일을 다시 수정하면 확인 상태를 초기화한다.
  - ~~**2-3 이메일 인증코드**~~ → **사용자 결정으로 이번 범위에서 제외한다.** 회원가입 화면에서 이메일 중복확인만 하고, 6자리 인증코드 발송/검증 단계는 구현하지 않는다(원래 명세에는 있었으나 구현 범위에서 뺌 — 관련 mock 유틸/필드/카운트다운 UI 전부 제거).
  - **2-4 비밀번호 / 비밀번호 확인**: 8~20자, 영문 대소문자·숫자·특수문자 중 3종 이상을 조합해야 한다. 입력 중 실시간으로 강도를 검증하고 안내 문구를 표시한다. 비밀번호 확인란이 일치하면 "✓ 비밀번호가 일치합니다."(녹색), 불일치하면 빨간 안내를 표시한다. 이메일과 동일한 문자열은 비밀번호로 사용할 수 없다.
  - **2-5 가입하기 버튼**: 활성 조건은 모든 필수 입력이 유효 + 이메일 중복확인 통과(**이메일 인증코드·약관 동의는 이번 범위에서 제외 — 위 참고**)이다. 성공 시 가입 완료 화면으로 이동하고, 실패 시 해당 필드로 스크롤하며 오류를 표시한다. (참고: App은 3단계 스텝(약관 → 계정 정보 → 완료)으로 분할하고 상단 진행 바를 표시하지만, 이는 App 이야기이므로 이번 Web 구현 범위가 아니다.)

- 필요 에셋/아이콘:
  - `src/assets/logo.svg` (BrandPanel, 로그인 화면과 공용)
  - 안내 문구 앞 "ⓘ" 글리프: 피그마 원본이 텍스트 유니코드 문자다. 텍스트 그대로 두거나 lucide-react `Info` 아이콘으로 대체 — 구현 재량
  - 성공 표시 "✓" 글리프: 텍스트 그대로 또는 lucide-react `Check` — 구현 재량
  - 로딩/스피너: 로그인 화면과 동일하게 신규 필요 (확인 필요)

- 반응형 기준: 위 "전체 레이아웃 / 반응형 원칙" 참고. `xl:`(1024px) 이상에서 BrandPanel 560px 고정 노출, 미만에서 BrandPanel 숨김 + FormPanel 전체 폭.

### 화면 3: 가입 완료 · 목표 설정
- 라우트: `/signup/complete` (신규 — `src/routes/paths.ts`에 `ROUTES.signupComplete` 추가 제안, 확인 필요)
- 신규 화면: 기존 코드 없음. 회원가입 성공 시에만 진입 가능해야 한다(직접 URL 접근 시 처리 방식은 확인 필요).
- 컴포넌트 트리:
  - `SignupCompletePage` (`src/pages/SignupComplete/index.tsx`, 배경 `#f4faef` 전체 화면, 중앙 정렬 카드)
    - `CompleteCard` (흰 배경, radius 24px, shadow, 최대 폭 520px)
      - `Icon` (원형 배경 `#e9f6e4`, 크기 80px, 이모지 🎉)
      - `Heading` ("가입이 완료되었어요!" Bold 26px `#1f2420`, 중앙 정렬 + "이번 달 절약 목표를 설정하면 대시보드에서 달성률을 한 눈에 볼 수 있어요." Regular 14px `#899086`)
      - `GoalInput`
        - 라벨 "월 절약 목표 금액" (Medium 14px `#1f2420`)
        - 금액 입력 필드(테두리 `#4fb75b` 강조, 배경 `#fafbf8`, radius 12px, 우측 "원" 단위 표기, 값 예시 "100,000")
        - `Chips` (추천 금액 4개: "5만원"/"10만원"/"20만원"/"직접 입력", 선택된 칩은 배경 `#e9f6e4` + 테두리 `#4fb75b` + 텍스트 `#3e9b48`, 나머지는 흰 배경 + 테두리 `#e7eae4` + 텍스트 `#899086`)
      - `SubmitButton` ("멈칫 시작하기", 배경 `#4fb75b`, radius 12px)
      - `SkipLink` ("나중에 설정할래요", Medium 14px `#899086`)

- 상태/데이터:
  - `goalAmount: number | null` — 콤마 자동 포맷 표시, 내부 값은 숫자
  - `selectedChip: '50000' | '100000' | '200000' | 'custom' | null`
  - `goalError: string | null` — 범위(1만원~1,000만원) 밖 입력 시 안내
  - `isSubmitting: boolean`

- 인터랙션 (기능 명세 `182:712` 전문 반영):
  - **3-1 월 절약 목표 금액 입력**: 숫자만 입력 가능하며 천 단위 콤마를 자동 포맷한다(예: 100,000). 입력 범위는 1만원~1,000만원이며 범위를 벗어나면 안내를 표시한다. 추천 칩(5만/10만/20만원) 탭 시 해당 금액이 자동 입력되고, "직접 입력" 탭 시 입력 필드에 포커스(키패드)가 간다.
  - **3-2 시작하기 / 건너뛰기**: `[멈칫 시작하기]` 클릭 시 목표를 저장하고 홈 대시보드로 이동하며, 홈의 "지금까지 절약한 금액" 카드에 목표 대비 진행률이 반영된다. `[나중에 설정할래요]` 클릭 시 목표를 설정하지 않은 상태로 홈으로 이동하고, 이후 마이페이지 > 절약 목표에서 언제든 설정할 수 있다(마이페이지는 범위 밖이므로 이번 구현에서는 진입 경로 없이 이 문구만 유효하다는 전제). 목표는 매월 1일 자동 초기화되지 않고 유지되며, 수정 시 당월부터 반영된다(목표 수정 UI 자체는 이번 화면 범위 밖).

- 필요 에셋/아이콘: 이모지 "🎉" 텍스트 그대로 사용(피그마 원본과 동일, 별도 아이콘 대체 불필요)

- 반응형 기준: 다른 두 화면과 달리 좌우 2단 레이아웃이 아니라 단일 중앙 카드 레이아웃이라 BrandPanel 유무 이슈가 없다. 카드 최대 폭 520px, 뷰포트가 좁아지면 좌우 여백을 유지하며 카드 폭이 줄어든다.

## 색상 토큰 (하드코딩 값, Figma 변수 없음)
| 용도 | Hex |
|---|---|
| 브랜드 그린(버튼/체크박스 배경) | `#4FB75B` |
| 브랜드 그린(강조 텍스트/링크) | `#3E9B48` |
| 배경 그린(BrandPanel) | `#E9F6E4` |
| 배경 그린(Badge) | `#DFF3D8` |
| 진한 텍스트 | `#1F2420` |
| 보조 텍스트 | `#899086` |
| Placeholder 텍스트 | `#ADB3A9` |
| Input 배경 | `#FAFBF8` |
| Input 테두리 / 비활성 버튼 배경 | `#E7EAE4` |
| 에러 레드 | `#E05B4E` |

폰트: `Noto Sans KR` (Bold/Medium/Regular) — 웹폰트 로드 여부는 "확인 필요" 참고.

## 확인 필요 (사용자 승인 시 답변 필요)

> 아래 1~5번은 사용자 승인 단계에서 답변을 받아 **해소됨**. 개요/화면별 섹션에 결정 내용을 반영했다. 6번 이후는 developer 단계 착수 전 추가 확인이 필요하다.

1. ~~약관 동의 UI 불일치~~ → **해소**: 이번 범위에서 생략(약관 UI 없이 가입하기 버튼 구현).
2. ~~이메일 중복 확인/OTP/로그인 실패 제한/비밀번호 찾기/닉네임 저장/로그인 상태유지 백엔드 처리~~ → **해소**: Supabase 기본 제공 기능(`signUp`/`signIn`/`resetPasswordForEmail`)은 실연동, 그 외(사전 이메일 중복확인, 6자리 OTP, 실패 횟수 카운터, httpOnly 커스텀 쿠키)는 이번 범위에서 mock 처리.
3. ~~BrandPanel 반응형 fallback~~ → **해소**: 1024px 미만에서 BrandPanel 숨김, 폼만 전체 폭 표시.
4. ~~가입 완료 후 이동 화면~~ → **해소**: `182:327` "가입 완료·목표 설정" 화면으로 이동(화면 3 참고).
5. ~~비밀번호 재설정 화면~~ → **해소**: 최소 UI로 이번에 신규 구현. `/reset-password` 라우트(제안)로 기존 입력 필드 스타일을 재사용해 새 비밀번호/비밀번호 확인 입력 화면을 만들고, 성공 시 로그인 화면으로 이동한다. 피그마 디자인이 없으므로 로그인/회원가입 폼과 동일한 톤(공용 입력 필드 스타일, BrandPanel 레이아웃)으로 맞춘다.
6. ~~절약 목표 저장 백엔드~~ → **해소**: 이번에 Supabase에 `profiles`(닉네임 포함) / `goals`(월 절약 목표) 테이블을 신설해 실제 저장까지 구현한다. 스키마는 `docs/plans/backend-setup.md`의 `worries` 테이블과 동일한 컨벤션(RLS `auth.uid() = user_id` 정책 등)으로 developer 단계에서 설계한다. 닉네임 서비스 내 중복이 허용되므로 `profiles.nickname`에는 UNIQUE 제약을 걸지 않는다(식별은 `user_id`/이메일 기준, 명세 2-1 참고).
7. **가입 완료·목표 설정 화면 라우트/접근 제어**: 라우트명을 `/signup/complete`로 제안했는데 확정 필요. 또한 이 화면은 회원가입 직후에만 자연스러운 화면인데, 로그인된 사용자가 URL을 직접 입력해 접근하는 것을 막을지(예: 회원가입 직후 플래그 없으면 홈으로 리다이렉트) 여부 확인 필요.
8. **StatCard 데이터 소스**: 로그인 전 화면에 노출되는 "111,111,111원" 누적 절약액을 실제 서비스 전체 집계로 연동할지, 정적 더미 값으로 하드코딩할지 확인 필요. (`docs/plans/backend-setup.md`에서 `totalSavedAmount` 집계 정의 자체가 보류 상태임을 참고.)
9. **Noto Sans KR 웹폰트 도입 여부**: 현재 프로젝트는 시스템 폰트 스택만 쓰고 웹폰트를 로드하지 않는다(홈 화면 피그마의 `Inter`는 한글 글리프가 없어 애초에 폴백이 필수였음). 이번 피그마는 한글도 지원하는 `Noto Sans KR`을 명시적으로 지정하므로, 웹폰트를 새로 로드(`@font-face`/CDN 등 추가)해서 피그마와 동일한 폰트를 쓸지, 아니면 기존처럼 시스템 폰트 폴백으로 대체할지 확인 필요.
10. **눈 아이콘/체크마크 등 아이콘 대체**: 피그마에는 "👁", "✓", "ⓘ" 등이 텍스트 이모지/유니코드 글리프로 표기돼 있다. 실제 구현은 lucide-react 아이콘(`Eye`/`EyeOff`, `Check`, `Info`)으로 대체하는 것을 제안하는데, 이 매핑으로 확정해도 되는지 확인 필요.
11. **로딩 스피너 컴포넌트**: 로그인/가입하기/시작하기 버튼 클릭 시 표시할 로딩 스피너의 구체적인 비주얼이 피그마에 없다. 간단한 CSS 스피너로 신규 구현하는 것으로 진행해도 되는지 확인 필요.

## 작업 순서 제안 (developer 서브에이전트용)
1. 남은 "확인 필요"(7~11번)는 developer 단계에서 애매함이 실제로 부딪히는 시점에 `AskUserQuestion`으로 확인한다(라우트명, StatCard 데이터, 폰트, 아이콘, 스피너 등 — 큰 결정은 이미 위에서 해소됨).
2. Supabase에 `profiles`(컬럼: `id`(FK `auth.users.id`), `nickname`, `created_at`, `updated_at`, UNIQUE 없음), `goals`(컬럼: `id`, `user_id`(FK), `monthly_amount`, `created_at`, `updated_at`) 테이블 신설 + RLS(`auth.uid() = user_id`/`id`) 적용. `docs/plans/backend-setup.md`의 `worries` 테이블 DDL 패턴을 따른다.
3. `src/components/auth/BrandPanel.tsx` 공용 컴포넌트 작성 (로고, 카피, StatCard, 카피라이트).
4. 공용 입력 필드 스타일(테두리/배경/에러·성공 상태) 컴포넌트화 — 로그인/회원가입/비밀번호 재설정 전체에서 재사용.
5. `src/pages/Login/index.tsx`를 이 계획의 `LoginPage` 구조로 교체: `Heading` → `EmailField`/`PasswordField` → `Options`(체크박스+링크) → `SubmitButton` → `SignupLink`. 기존 `handleSignIn`(AuthContext `signIn` 호출) 로직은 그대로 재사용하되, 이메일 blur 검증/버튼 활성 조건/에러 문구를 명세대로 반영한다. "비밀번호를 잊으셨나요?" 링크는 `/reset-password`로 연결한다.
6. 비밀번호 재설정 화면(`src/pages/ResetPassword/index.tsx`, 신규 라우트 `/reset-password`) 구현: 이메일 입력 → `resetPasswordForEmail` 호출 → 성공/실패 무관 "메일이 발송되었습니다" 동일 안내. 재설정 링크를 받아 돌아왔을 때(Supabase recovery 세션) 새 비밀번호 입력 폼으로 전환하는 최소 UI도 같은 페이지 또는 하위 라우트에 포함한다.
7. `src/pages/SignUp/index.tsx`를 이 계획의 `SignUpPage` 구조로 교체: `Heading` → `NicknameField` → `EmailField`+중복확인 → `PasswordField`/`PasswordConfirmField` → `SubmitButton` → `LoginLink` (이메일 인증코드 단계 없음). 이메일 중복확인은 mock으로 구현하고, `signUp` 성공 후 닉네임을 `profiles`에 저장한 뒤 `ROUTES.signupComplete`로 이동한다.
8. `src/routes/paths.ts`에 `ROUTES.signupComplete`, `ROUTES.resetPassword` 추가, 라우터에 `src/pages/SignupComplete/index.tsx` 등록. 화면 3(`SignupCompletePage`) 구현: `Icon` → `Heading` → `GoalInput`(칩 선택 + 직접 입력 + 범위 검증) → `SubmitButton`("멈칫 시작하기", `goals` 테이블에 저장 후 홈 이동) → `SkipLink`("나중에 설정할래요", 저장 없이 홈 이동).
9. `xl:`(1024px) 브레이크포인트 기준으로 BrandPanel 표시/숨김 반응형 처리 적용, FormPanel 유동 폭/최대 폭 처리.
10. 에러/성공 상태 문구를 명세서 원문 그대로 정확히 반영했는지 재확인 (임의로 문구를 바꾸지 않는다).
11. 수동 검증: 좁은 뷰포트(1024px 미만)에서 BrandPanel 숨김 확인, 로그인/회원가입/가입완료/비밀번호 재설정 폼 각 필드의 검증·에러·성공 상태 UI가 명세대로 동작하는지 확인, 라우트 이동(`/login` ↔ `/signup` → `/signup/complete` → `/`, `/reset-password`, 로그인 성공 시 기존 라우트) 확인.

## developer 단계 확정 사항 (구현 완료 후 기록)

### 확인 필요 7~11번 답변 (사용자 승인)
7. 라우트 `/signup/complete`, `/reset-password` 확정. 로그인된 사용자가 `/signup/complete`에 회원가입 직후가 아닌 상태로 직접 접근하면 홈(`/`)으로 리다이렉트.
8. StatCard "111,111,111원" / "+11,000원"은 정적 하드코딩.
9. Noto Sans KR을 Google Fonts로 로드(`index.html`에 `<link>` 추가, `--font-noto` 토큰으로 인증 화면에만 적용, 기존 화면의 시스템 폰트는 변경하지 않음).
10. 아이콘: 👁→`Eye`/`EyeOff`, ✓→`Check`, ⓘ→`Info` (lucide-react)로 대체.
11. 로딩 스피너: `src/components/Spinner.tsx` CSS 스피너 신규 구현.

### `profiles` / `goals` 테이블 DDL (Supabase SQL Editor에서 직접 실행 필요)

`worries` 테이블과 동일한 컨벤션(RLS `auth.uid() = user_id`, `set_updated_at` 트리거)을 따른다. `goals`는 "매월 자동 초기화되지 않고 수정 시 당월부터 반영"되는 정책이라 사용자당 1행(upsert)으로 설계했다.

```sql
-- profiles: 닉네임 (서비스 내 중복 허용 → UNIQUE 없음)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nickname text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- goals: 사용자당 1행(월 절약 목표), 수정 시 upsert
create table public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  monthly_amount integer not null check (monthly_amount > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.goals enable row level security;

create policy "goals_select_own" on public.goals
  for select using (auth.uid() = user_id);
create policy "goals_insert_own" on public.goals
  for insert with check (auth.uid() = user_id);
create policy "goals_update_own" on public.goals
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- updated_at 자동 갱신 트리거 (worries 테이블 설정 때 이미 만들었다면 재실행해도 안전 — create or replace)
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger goals_set_updated_at
before update on public.goals
for each row execute function public.set_updated_at();
```

### 그 외 구현 중 발견/결정 사항
- **로컬 `.env` 부재**: 이 작업 디렉터리에는 `think24/.env`(`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)가 없어 로컬에서 `pnpm dev` 실행 시 `src/lib/supabase.ts`의 가드에서 즉시 에러가 난다(빈 화면). 실제 동작 검증을 위해서는 실제 Supabase 프로젝트 값으로 `.env`를 채워야 한다.
- **Supabase "Confirm email" 설정 확인 필요**: `signUp` 직후 세션이 즉시 발급되어야 `profiles` insert(RLS `auth.uid() = id`)가 가능하므로, Supabase 프로젝트의 Authentication 설정에서 "Confirm email"이 꺼져 있어야 한다. 켜져 있으면 회원가입 마지막 단계에서 안내 메시지와 함께 막힌다(코드에서 이 경우를 감지해 에러로 표시하도록 처리했다).
- **로그인 5회 실패 잠금 / 이메일 중복확인**: 계획대로 mock 처리. 실패 횟수·잠금은 컴포넌트 state 기준(새로고침 시 초기화), 이메일 중복확인은 항상 "사용 가능"으로 응답(최종 중복 검증은 실제 `signUp` 호출 시 Supabase가 수행).
- **[구현 중 범위 변경 반영]** 이메일 인증코드(OTP) 단계를 제외하기로 함에 따라 `src/lib/mockEmailVerification.ts`에서 `generateVerificationCode`(코드 생성 함수)를 제거했다. `checkEmailAvailability`(이메일 중복확인 mock)는 계속 사용한다. `src/hooks/useCountdown.ts`는 로그인 5회 실패 잠금(10분) 카운트다운에서 계속 사용되므로 그대로 유지한다.
