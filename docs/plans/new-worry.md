# 새 고민 생성 화면 구현 계획

## 개요
- 이슈: #29 `[feat] 새 고민 생성 화면 구현`
- 브랜치: `29-feat-새-고민-생성-화면-구현`
- 피그마 링크: https://www.figma.com/design/Tjb8LmHOOZXQMLSL86LSJC/일상뒤집기-디자인?node-id=0-1 (fileKey `Tjb8LmHOOZXQMLSL86LSJC`)
- 관련 화면/노드: "타이머 생성 (새 고민 생성)" 섹션 헤더 텍스트(`265:1660`, x≈-3725, y=6194)를 기준점으로 삼아 그 아래/오른쪽에 흩어진 다수의 목업 중, 실제로 "새 고민 생성"에 해당하는 요소만 좌표로 추려냈다. 상세 위치는 아래 "피그마 구조 분석 메모" 참고. 라우트는 이미 정의된 `ROUTES.newWorry = '/worries/new'` (아직 화면 없음 — 이번에 처음 연결).
- 한 줄 요약: 상품 정보 입력 → (OpenAI 기반) AI 질문 5개 생성 → 5개 질문에 순차 답변 → AI가 답변을 종합해 "필요한 소비/불필요한 소비" 참고용 판정을 보여줌 → 사용자가 직접 "24시간 고민 시작하기" 또는 "홈으로 돌아가기(등록 취소)"를 선택하는 하나의 위저드(단일 라우트, 내부 스텝 전환) 화면을 구현한다. OpenAI 호출은 반드시 Supabase Edge Function을 통해 프록시한다.

## 피그마 구조 분석 메모 (중요 — 개발 시 반드시 참고)

CLAUDE.md에 적힌 대로 이 파일은 플랫 캔버스이고, "새 고민 생성" 관련 목업도 같은 문제(배경 사각형과 실제 콘텐츠가 형제 레이어로 분리, 검은 원+숫자 마커는 스펙 설명용)를 그대로 가진다. 이번 조사에서 추가로 확인된, **이 섹션 특유의 함정**:

1. **`get_screenshot`/`get_design_context`로 배경 사각형(예: `1920×1080` Rectangle) 노드를 직접 조회해도 그 위에 겹쳐 보이는 형제 텍스트/아이콘이 전혀 렌더링되지 않는다.** 이 파일의 배경 요소들은 진짜 프레임(컨테이너)이 아니라 순수한 leaf `rectangle` 도형이라서, `contentsOnly` 옵션과 무관하게 자기 자신의 색만 그려진다. `get_screenshot`으로 미리보기를 확인하면 모두 단색 빈 화면으로 보이므로, **이 섹션은 `get_metadata` 텍스트 덤프에서 좌표·이름을 grep으로 추출하는 방식으로만 스펙을 재구성할 수 있었다.** 이후 화면 구현 시에도 동일한 방식(좌표 기반 텍스트 매칭)을 신뢰해야 하며, 새로 스크린샷을 시도해 "비어 보인다"고 콘텐츠가 없다고 오판하지 않도록 주의.
2. **웹 크기(1920×1080) 배경들 중 다수가 실제로는 "새 고민 생성"과 무관한 다른 화면(특히 마이페이지)의 오배치/중복 사본이었다.** 예: `326:776`(x=2308, y=8214), `332:598`, `334:697`, `335:1049` 등은 바로 위에 "질문 생성"/"타이머 생성 완료" 같은 구간 헤더 라벨이 있어 처음엔 "새 고민 생성"의 웹 화면으로 추정했지만, 실제 자식 텍스트를 좌표로 대조하니 "프로필 수정", "닉네임", "로그아웃", "여름"(닉네임 예시) 등 **마이페이지 화면 내용이 그대로 복사되어 있었다** (완성되지 않은 상태로 남겨진 복제본으로 추정). 이런 함정 때문에 "헤더 라벨과 가장 가까운 큰 배경"만 보고 화면을 단정하지 말고, 반드시 그 배경 범위 내 텍스트 내용까지 대조해야 한다.
3. **"새 고민 생성"의 진짜 웹 목업은 `290:516`/`292:641` 클러스터(x≈-3687~324, y≈10306~11386)에 있다.** 사이드바 nav 라벨이 "새 고민 생성"(활성 하이라이트)이고, 실제 폼 필드(상품명/상품가격/카테고리/사진 추가)와 3단계 위저드 헤더(상품 정보/질문/완료)가 이 범위 안에 존재해 확인했다. 다만 **이 웹 목업은 "상품 정보 입력" 스텝 하나만 존재한다.** 같은 방식으로 "질문 답변", "AI 로딩", "AI 판정 결과", "타이머 생성 완료" 스텝의 웹 전용 목업은 문서 전체를 텍스트 검색해도 찾지 못했다(관련 텍스트/마커는 전부 `390px`/`375px` 폭의 **모바일** 프레임에서만 발견됨). 따라서 **상품 정보 입력 화면만 웹 실측 스펙이 있고, 나머지 5개 스텝은 모바일 목업을 기준으로 반응형으로 웹에 적용해야 한다** (CLAUDE.md의 반응형 원칙과 일치).
4. **모바일 목업은 매우 상세하고 완전하다.** 상품 정보 입력(`265:16xx`~`265:17xx`, 숫자 마커 1~7번), 질문 로딩(`313:491` "AI 질문 생성 로딩화면"), 질문 응답(`313:456`/`315:574` "질문 기본화면"/"질문 선택시 화면"), 분석 로딩(`316:738` "AI 질문 분석 로딩화면"), 판정 결과(`316:794` "고민 분석 완료 - 긍정", `325:623` "고민 분석 완료 - 부정", 그리고 아래 5번 항목의 보정된 사본 `334` 클러스터), 타이머 생성 완료(`326:682` "타이머 생성 완료")까지 각 스텝이 이름이 붙은 헤더 프레임(390×88)과 함께 존재한다. 이 계획서의 스펙 대부분은 이 모바일 클러스터에서 추출했다.
5. **피그마 자체의 카피 오류 및 보정된 사본 발견**: "고민 분석 완료 - 긍정"(`316:794`)과 "고민 분석 완료 - 부정"(`325:623`) 클러스터(x≈4676~5474)는 두 변형 모두 제목 텍스트가 "이 물건은 필요한 소비로 보여요"로 **동일하다**(부정 변형에서 고쳐지지 않은 카피 오류로 추정). 그런데 코디네이터 요청으로 에셋(`success.svg`/`danger.svg`) 크기 매칭을 위해 **같은 화면의 또 다른 사본인 `334` 클러스터(x≈5162~7647, y=9423 행)를 추가로 뒤져보니, 이 사본은 부정 판정 제목이 "충동구매 가능성이 높아요"로 긍정과 다르게 올바로 작성되어 있었다.** 두 사본의 나머지 텍스트(설명 문구, 3개 지표)는 동일하다. **이번 계획은 카피가 정확한 `334` 클러스터의 문구를 최종 스펙으로 채택한다**(아래 "AI 판정 결과 스텝 상세" 참고 — 기존에 "확인 필요"로 남겨뒀던 항목이 이번 조사로 해결됨).
6. **검은 원(`Ellipse 9`) + 숫자 마커**가 상품 정보 입력 화면에 1~7번까지 순서대로 붙어 있고, 각 마커 옆 설명 텍스트가 이번 계획의 필드별 요구사항(필수/선택, 검증 규칙)의 핵심 근거다. 아래 "상품 정보 입력 필드 상세"에 전부 반영했다.
7. Figma 변수(`get_variable_defs`)는 확인하지 않았다(다른 화면들과 동일하게 이 파일 전체가 변수 미사용, 하드코딩 hex로 확인된 전례를 따름 — 아래 색상은 개별 노드의 `get_design_context`로 직접 추출한 값이다).

## 신규 에셋 3종 매칭 (`src/assets/cloud.svg`/`danger.svg`/`success.svg`)

사용자가 이번 이슈를 위해 미리 추가해 둔 3개 에셋을, 모바일 클러스터의 실제 아이콘 인스턴스 크기와 대조해 정확히 매칭했다(이름만으로 추정하지 않고 뷰박스 크기·비율을 실측 인스턴스와 비교):

| 에셋 | 뷰박스 크기 | 매칭된 피그마 인스턴스 | 용도 |
|---|---|---|---|
| `cloud.svg` | 184×146 (비율 1.26:1) | `313:511`(75×76), `316:761`(96×76), `334:842`(207×165 — 비율 1.254:1로 가장 근접) | **AI 로딩 화면(질문 생성 로딩 + 판정 분석 로딩) 상단 일러스트.** 세 인스턴스 모두 같은 구름 모양 아이콘이 크기만 다르게 배치된 것으로 판단, 두 로딩 화면에 동일하게 재사용 |
| `success.svg` | 91×91 | `334:844`(`image 480`, 91×91 — **정확히 일치**) | AI 판정 결과 **"긍정(필요한 소비)"** 화면 상단 아이콘 |
| `danger.svg` | 102×102 | `334:869`(`image 483`, 102×102 — **정확히 일치**) | AI 판정 결과 **"부정(불필요/충동구매)"** 화면 상단 아이콘 |

- `success.svg`/`danger.svg`는 `334` 클러스터(위 "피그마 구조 분석 메모" 5번에서 언급한, 카피가 정확한 보정 사본)에서 정확히 일치하는 크기의 인스턴스를 찾았다. `325:562`처럼 52×52로 더 작게 배치된 동일 아이콘의 축소 사본도 있으나, 대표 실측치는 `334` 클러스터의 91×91/102×102다.
- **매칭되지 않는 자리**: 상품 정보 입력 화면(스텝 1)의 이미지 업로드 카드 안에 있는 아이콘(`291:602`/`292:705` `image` 요소, 72×72)은 이 3개 에셋 중 어느 것과도 크기·비율이 맞지 않는다. 이 자리는 위 3개 에셋으로 매칭할 수 없어 아래 "확인 필요"에 추가했다(잠정적으로 lucide-react `ImagePlus` 아이콘으로 대체 제안).

## 전체 플로우

```
[스텝 1] 상품 정보 입력 (웹 실측 목업 있음)
   │  "다음" 클릭 (필수 필드 검증 통과)
   ▼
[스텝 2] AI 질문 생성 로딩 ("AI가 관련 질문을 생성 중입니다.")
   │  Edge Function `ai-generate-questions` 호출 → 질문 5개 수신
   ▼
[스텝 3] 질문 응답 (1/5 ~ 5/5, 질문당 3지선다 고정 옵션)
   │  각 질문: "네, 꼭 필요해요." / "있으면 좋을 거 같아요." / "잘 모르겠어요."
   │  "이전"으로 직전 질문(1번째의 "이전"은 스텝1로 복귀)/"다음"으로 진행
   │  5번째 질문 "다음" 클릭 (5개 모두 응답 완료)
   ▼
[스텝 4] AI 분석 로딩 ("AI가 분석 중이에요." / "모든 답변을 종합하여 당신의 소비 패턴을 분석하고 있어요.")
   │  Edge Function `ai-generate-verdict` 호출 → 판정 수신
   ▼
[스텝 5] AI 판정 결과 (참고용 표시. 자동 분기 없음)
   │  필요성/충동성/가격 적정성 3개 지표(%+등급) + 종합 코멘트
   │  사용자가 아래 두 버튼 중 하나를 "직접" 선택:
   ├─ "24시간 고민 시작하기" → 이미지 업로드 + worries row insert(deadline_at = now+24h) → 스텝 6
   └─ "홈으로 돌아가기" → 아무 것도 저장하지 않고 즉시 `/`(홈)로 이동, 위저드 상태 폐기
   ▼
[스텝 6] 타이머 생성 완료 ("24시간 고민을 시작합니다!" / "타이머가 시작되었습니다...")
   │  "고민 목록으로 가기" 버튼 → `/worries`로 이동
```

- 스텝 1~6은 **모두 하나의 라우트(`/worries/new`) 안에서 컴포넌트 상태로 전환**한다(피그마의 상단 3단계 위저드 표시가 "상품 정보/질문/완료"라는 하나의 연속 플로우임을 보여주므로, 서브 라우트로 쪼개지 않는다). 새로고침 시 진행 상태가 날아가는 것은 이번 범위에서 허용한다(피그마에 새로고침 복구에 대한 언급 없음).
- **Supabase 쓰기(이미지 업로드 + `worries` row insert)는 스텝 5에서 "24시간 고민 시작하기"를 눌렀을 때 단 한 번만 발생한다.** 그 전까지(상품 정보/질문/AI 판정)는 전부 React 로컬 상태로만 보관한다 — "홈으로 돌아가기"를 누르면 로컬 상태를 버리기만 하면 되고, 고아 상태의 storage 파일이나 draft row가 생기지 않는다.

## 데이터 모델 변경 (Supabase)

### 1. `worries` 테이블 컬럼 추가

기존 스키마(`docs/plans/backend-setup.md`)에 이번 기능에 필요한 컬럼을 추가한다. `category`는 피그마 상품 정보 화면에 있는 필수 드롭다운인데 기존 스키마엔 없었다.

```sql
alter table public.worries
  add column category text,
  add column purchase_url text,
  add column ai_questions jsonb,
  add column ai_answers jsonb,
  add column ai_verdict jsonb;
```

| 컬럼 | 타입 | 설명 |
|---|---|---|
| `category` | `text` | 상품 카테고리(드롭다운 선택값). 기존 row는 데이터 없음(null 허용) |
| `purchase_url` | `text` | 구매 사이트 URL(선택 입력, null 허용) |
| `ai_questions` | `jsonb` | AI가 생성한 5개 질문. `[{ question: string; reason: string }]` |
| `ai_answers` | `jsonb` | 사용자가 고른 5개 답변. `[{ question: string; answer: string }]` (answer는 3지선다 중 하나의 텍스트) |
| `ai_verdict` | `jsonb` | AI 판정 결과. `{ verdict: 'necessary' \| 'unnecessary'; title: string; description: string; scores: { necessity: {percent:number; label:string}; impulsiveness: {...}; priceFit: {...} } }` |

- `ai_questions`/`ai_answers`/`ai_verdict`는 고민 상세 페이지 등에서 나중에 다시 보여줄 계획이 확정되어(아래 "확인 완료" 7번), 이번에 컬럼을 추가해 그대로 저장해둔다(상세 조회 화면 자체는 이번 이슈 범위 밖).
- `category` 전체 목록이 9개로 확정되었으므로(아래 "확인 완료" 1번), `check` 제약으로 걸어 데이터 무결성을 보장한다:
  ```sql
  alter table public.worries
    add constraint worries_category_check
    check (category in ('가구·인테리어', '뷰티', '생활용품', '식품', '운동·건강', '전자기기', '취미', '패션', '기타'));
  ```

### 2. Storage 버킷 신설 (상품 이미지 업로드)

```sql
insert into storage.buckets (id, name, public)
values ('worry-thumbnails', 'worry-thumbnails', true)
on conflict (id) do nothing;

-- 본인 소유 폴더(userId/...)에만 업로드 가능
create policy "worry_thumbnails_insert_own"
on storage.objects for insert
with check (
  bucket_id = 'worry-thumbnails'
  and auth.uid()::text = (storage.foldername(name))[1]
);

-- 썸네일은 홈/목록 등에서 보여줘야 하므로 공개 읽기 허용
create policy "worry_thumbnails_select_public"
on storage.objects for select
using (bucket_id = 'worry-thumbnails');

-- 본인 소유 파일만 삭제/교체 가능
create policy "worry_thumbnails_update_own"
on storage.objects for update
using (auth.uid()::text = (storage.foldername(name))[1])
with check (bucket_id = 'worry-thumbnails');

create policy "worry_thumbnails_delete_own"
on storage.objects for delete
using (
  bucket_id = 'worry-thumbnails'
  and auth.uid()::text = (storage.foldername(name))[1]
);
```

- 파일 경로 컨벤션: `worry-thumbnails/{user_id}/{timestamp}-{원본파일명}` (예: `worry-thumbnails/2f1c.../1723190000000-mug.jpg`). `storage.foldername(name)[1]`이 `user_id`와 일치하는지로 RLS를 건다(마이페이지 아바타 업로드용으로 설계했다가 취소된 패턴과 동일한 아이디어를 재사용).
- 이미지를 첨부하지 않으면 `thumbnail_url`은 기존처럼 `null`로 남긴다(별도 기본 이미지를 스토리지에 올리지 않음 — 화면에서 null일 때 클라이언트 쪽 placeholder를 보여주는 처리는 이 화면의 표시 로직이 아니라 향후 고민 목록/홈 화면 쪽 몫이라 이번 범위에서는 "빈 값 그대로 저장"까지만 책임진다).
- 업로드는 최대 1장(피그마 마커 설명: "사진은 최대 한 장만 가능합니다"), `accept="image/*"` 네이티브 `<input type="file">` 사용(사용자 확인 완료 — 모바일 목업의 "카메라 촬영/갤러리에서 선택" 모달은 웹에 적용하지 않는다).

## Edge Function 설계 (OpenAI 프록시)

OpenAI API 키는 절대 프론트엔드 번들에 포함하지 않는다. 두 개의 Edge Function으로 분리한다(질문 생성과 판정 생성은 프롬프트/응답 스키마가 서로 다르고 호출 시점도 분리되어 있어, 관심사 분리 및 독립적인 에러 처리·재시도를 위해 하나로 합치지 않는 것을 제안한다).

### 1. `ai-generate-questions`
- 경로: `supabase/functions/ai-generate-questions/index.ts`
- 인증: Supabase 클라이언트(`supabase.functions.invoke`)로 호출하면 로그인 세션의 JWT가 자동으로 `Authorization` 헤더에 실린다. 함수 내부에서 `Deno`용 Supabase 클라이언트로 `auth.getUser()`를 호출해 로그인 사용자인지 검증하고, 비로그인 요청은 401로 거부한다(무단 호출로 OpenAI 비용이 소모되는 것 방지).
- 입력(JSON body):
  ```ts
  { name: string; price: number; category: string; purchaseUrl?: string }
  ```
- 출력:
  ```ts
  { questions: { question: string; reason: string }[] } // 정확히 5개
  ```
- 동작: OpenAI Chat Completions API(JSON 모드/구조화 출력 사용 권장, 5개 고정 개수를 스키마로 강제)를 호출해 상품 정보를 바탕으로 "필요한 소비인지 충동적인 소비인지 판단하기 위한" 질문 5개와 각 질문을 하는 이유를 생성한다. 프롬프트에는 피그마 예시 질문("이 물건이 정말 필요한 이유가 있나요?")과 톤을 참고 문구로 포함해 결과 톤을 맞춘다. 답변 선택지는 AI가 만들지 않고 프론트엔드가 항상 고정된 3개("네, 꼭 필요해요." / "있으면 좋을 거 같아요." / "잘 모르겠어요.")를 붙인다.
- 실패 시 502 + 에러 메시지 반환, 프론트엔드는 로딩 화면에서 재시도 UI를 보여준다(피그마에 없는 상태라 "확인 필요"에도 표기).

### 2. `ai-generate-verdict`
- 경로: `supabase/functions/ai-generate-verdict/index.ts`
- 인증: 위와 동일(JWT 검증).
- 입력:
  ```ts
  {
    name: string; price: number; category: string; purchaseUrl?: string;
    answers: { question: string; reason: string; answer: string }[]; // 5개
  }
  ```
- 출력:
  ```ts
  {
    verdict: 'necessary' | 'unnecessary';
    title: string;       // 예: "이 물건은 필요한 소비로 보여요" / "충동구매 가능성이 높아요"
    description: string; // 예: "현재로서는 구매해도 괜찮을 것 같아요. 하지만 24시간 동안..."
    scores: {
      necessity: { percent: number; label: string };     // 예: 85, "높음"
      impulsiveness: { percent: number; label: string };  // 예: 20, "낮음"
      priceFit: { percent: number; label: string };       // 예: 50, "보통"
    };
  }
  ```
- 동작: 상품 정보 + 5개 Q&A를 OpenAI에 전달해 종합 판정과 3개 지표(필요성/충동성/가격 적정성)를 받는다. `verdict`에 따라 프론트엔드가 `success.svg`/`danger.svg` 아이콘과 문구 톤을 분기한다.

### 배포 절차 (developer 단계 안내용)
1. Supabase CLI 설치 확인: `supabase --version` (없으면 `brew install supabase/tap/supabase` 등으로 설치).
2. 프로젝트 연결(최초 1회): `supabase login`, `supabase link --project-ref <프로젝트 ref>`.
3. OpenAI API 키를 Edge Function 환경변수로 등록: `supabase secrets set OPENAI_API_KEY=sk-...` (로컬 `.env`에 넣는 `VITE_` 접두 변수와는 별개 — 절대 `VITE_`로 시작하면 안 됨. `VITE_` 접두 변수는 프론트엔드 번들에 노출되므로 사용 금지).
4. 함수 배포: `supabase functions deploy ai-generate-questions`, `supabase functions deploy ai-generate-verdict`.
5. 로컬 개발 중 테스트하려면 `supabase functions serve`로 로컬 실행 후 `.env`의 `VITE_SUPABASE_URL`을 로컬 함수 엔드포인트로 임시 전환하거나, 배포된 함수를 그대로 호출(개발 단계 재량).
- 사용할 OpenAI 모델(예: `gpt-4o-mini` vs `gpt-4o`)과 비용 한도는 "확인 필요"에 남긴다.

## 상품 정보 입력 필드 상세 (웹 실측 스펙 — `290:516`/`292:641` 클러스터 기준)

피그마 마커 1~7번 순서 그대로:

| # | 필드 | 필수 여부 | 스타일/검증 |
|---|---|---|---|
| 1 | 상단 3단계 위저드("상품 정보"/"질문"/"완료") | — | 현재 단계는 초록색으로 강조(마커 설명: "지금 어떤 단계인지 확인 할 수 있는 이미지입니다. 해당 단계가 되면 초록색으로 변합니다.") |
| 2 | 이미지 업로드 카드 | 선택 | 325×611 카드(`bg-[#efefef] rounded-[14px]`), 내부에 아이콘(72×72 — 신규 에셋 3종과 매칭 안 됨, 확인 필요) + "사진 추가" 텍스트. 미첨부 시 "기본 사진으로 등록됩니다"(= `thumbnail_url` null로 저장, 별도 기본 이미지 업로드 없음). 웹은 모달 없이 네이티브 파일 선택(`<input type="file" accept="image/*">`), 최대 1장 |
| 3 | 상품명 텍스트필드 | 필수 | 라벨 "상품명", 일반 텍스트 입력 |
| 4 | 상품 가격 텍스트필드 | 필수 | 숫자만 입력 가능, 3자리 콤마 자동 포맷(예: `36,000`). 입력창 스타일: `bg-white border border-[#757575] rounded-[7px]` (마이페이지 닉네임 입력창과 동일 톤) |
| 5 | 카테고리 드롭다운 | 필수 | 스크롤 가능한 드롭다운. 전체 옵션(확정): 가구·인테리어, 뷰티, 생활용품, 식품, 운동·건강, 전자기기, 취미, 패션, 기타 (9개, 이 순서대로) |
| 6 | 구매 사이트 URL 텍스트필드 | 선택 | 마커 설명에 "필수가 아니면 선택적으로 작성할 수 있습니다"로 명시된 유일한 필드 |
| 7 | "다음" 제출 버튼 | — | `bg-[#e9f6e4] rounded-[9px]`(활성, 마이페이지 "프로필 사진 변경" 버튼과 동일 톤). 필수 필드(상품명/가격/카테고리) 중 하나라도 비어 있으면 비활성화(회색) |

- 페이지 인트로 문구: "사고 싶은 물건에 대한 정보를 입력해주세요." (553×130, 타이틀 아래)
- 페이지 타이틀은 "새 고민 생성"(사이드바 활성 라벨과 동일 문구 — 마이페이지 타이틀과 같은 290×82 슬롯 크기·폰트를 재사용하는 것으로 추정, 마이페이지 `PageTitle`과 동일 스타일로 통일).

## 질문/답변 스텝 상세 (모바일 목업 `313`/`315`/`316` 클러스터 기준, 반응형으로 웹 적용)

- 상단: "AI 질문 (n/5)" 진행 표시.
- 질문 텍스트(예시: "이 물건이 정말 필요한 이유가 있나요?" — 실제로는 AI가 상품마다 다르게 생성).
- 고정 3지선다(라디오 버튼 형태): "네, 꼭 필요해요." / "있으면 좋을 거 같아요." / "잘 모르겠어요."
- "AI가 이 질문을 하는 이유" 토글/텍스트 — 질문별 `reason` 필드를 여기에 노출.
- 하단 "이전"/"다음" 버튼. "다음"은 현재 질문에 답변을 선택해야 활성화되는 것으로 판단(다른 폼과의 일관성 — 명시적 마커 문구는 없어 "확인 필요"에 표기). 1번째 질문의 "이전"은 스텝 1(상품 정보)로 복귀.
- 5번째 질문에서 "다음"을 누르면 AI 분석 로딩(스텝 4)으로 전환.

## AI 로딩 스텝 상세

- 질문 생성 로딩: "AI가 관련 질문을 생성 중입니다." (`313:491`)
- 판정 분석 로딩: "AI가 분석 중이에요." + "모든 답변을 종합하여 당신의 소비 패턴을 분석하고 있어요." (`316:738`, `334:835`)
- **아이콘**: `src/assets/cloud.svg`(184×146). 두 로딩 화면 모두 동일한 구름 모양 일러스트가 상단에 있고, 실측 인스턴스(`313:511` 75×76, `316:761` 96×76, `334:842` 207×165)가 전부 `cloud.svg`와 거의 동일한 1.26:1 비율이라 이 3개 로딩 화면 인스턴스 모두 `cloud.svg` 하나로 재사용한다.
- 스피너는 기존 `src/components/Spinner.tsx`를 `cloud.svg`와 함께 병행 표시하는 것을 제안(피그마엔 스피너 애니메이션이 명시돼 있지 않음 — 최종 배치는 developer 재량).

## AI 판정 결과 스텝 상세 (`334` 클러스터 — 카피가 정확한 사본 기준, 위 5번 메모 참고)

- 아이콘:
  - 긍정(필요한 소비) 판정: **`src/assets/success.svg`**(91×91) — 피그마 `334:844`(`image 480`) 인스턴스와 뷰박스 크기가 정확히 일치.
  - 부정(충동구매) 판정: **`src/assets/danger.svg`**(102×102) — 피그마 `334:869`(`image 483`) 인스턴스와 뷰박스 크기가 정확히 일치.
- "분석이 완료되었어요." → "AI가 당신의 답변을 바탕으로 다음과 같이 분석했어요." → 판정 제목:
  - 긍정: "이 물건은 필요한 소비로 보여요"
  - 부정: "충동구매 가능성이 높아요" (기존에 "확인 필요"로 남겼던 카피 오류 이슈는 정확한 사본을 추가로 찾아 해결됨)
- 3개 지표(`334` 클러스터 실측값 — 실제로는 Edge Function 응답값을 그대로 표시):

  | 지표 | 긍정 판정 예시 | 부정 판정 예시 |
  |---|---|---|
  | 필요성 | 85% "높음" | 25% "낮음" |
  | 충동성 | 20% "낮음" | 85% "높음" |
  | 가격 적정성 | 50% "보통" | 50% "보통" |

- 종합 설명 문구:
  - 긍정: "현재로서는 구매해도 괜찮을 것 같아요. 하지만 24시간 동안 다시 한 번 생각해보는 시간을 가져보세요."
  - 부정: "현재 구매하지 않아도 크게 불편하지 않아요. 24시간 후 다시 생각해보고, 더 현명한 선택을 해보세요."
- 버튼 2개(세로 배치):
  - "24시간 고민 시작하기": `bg-[#3e9b48] rounded-[5px]`, 흰 텍스트 — 주 버튼
  - "홈으로 돌아가기": `bg-white border border-[#a9a9a9] rounded-[5px]` — 보조 버튼
- **AI 판정과 무관하게 두 버튼 모두 항상 클릭 가능**(사용자 확인 완료 — AI가 자동으로 분기하지 않음).

## 타이머 생성 완료 스텝 상세 (`326:682` 기준)

- "24시간 고민을 시작합니다!" + "타이머가 시작되었습니다. 중간중간 작은 질문과 알림으로 더 현명한 소비를 도와드릴게요."
- "고민 목록으로 가기" 버튼(243×44) → `ROUTES.worries`(`/worries`)로 이동. (자동 리다이렉트 문구/타이머는 피그마에 없음 — 버튼 클릭으로만 이동)

## 화면 구성

### 화면: 새 고민 생성 (단일 라우트, 6개 내부 스텝)
- 라우트: `/worries/new` (`ROUTES.newWorry`, 기존 상수 재사용). `App.tsx`에 `ProtectedRoute` + `AppLayout` 하위 라우트로 추가(홈/마이페이지와 동일 패턴 — 사이드바 "새 고민 생성" 항목이 그대로 활성 하이라이트됨).
- 컴포넌트 트리 (제안):
  - `NewWorryPage` (`src/pages/NewWorry/index.tsx`) — `useNewWorryFlow` 훅으로 스텝/폼 상태 관리
    - `WizardStepper` — "상품 정보/질문/완료" 3단계 표시(활성 스텝 초록)
    - `ProductInfoStep` — 이미지 업로드(파일 input, 미리보기), 상품명, 가격(콤마 포맷), 카테고리 드롭다운, URL, "다음"
    - `QuestionGenLoadingStep` / `VerdictLoadingStep` — 공용 `AiLoadingScreen`(문구만 prop으로 전달) + `cloud.svg` + `Spinner`
    - `QuestionStep` — 질문 텍스트, 3지선다 `RadioOption` × 3, "AI가 이 질문을 하는 이유" 토글, "이전"/"다음"
    - `VerdictResultStep` — 아이콘(`success.svg`/`danger.svg`), 제목/설명, 3개 `ScoreRow`(필요성/충동성/가격 적정성), "24시간 고민 시작하기"/"홈으로 돌아가기" 버튼
    - `TimerStartedStep` — 완료 문구 + "고민 목록으로 가기" 버튼
- 상태/데이터 (`useNewWorryFlow` 훅):
  - `step: 'productInfo' | 'questionLoading' | 'questions' | 'verdictLoading' | 'verdict' | 'timerStarted'`
  - `productInfo: { name: string; price: number; category: string; purchaseUrl: string; imageFile: File | null }`
  - `questions: { question: string; reason: string }[] | null`
  - `answers: (string | null)[]` (길이 5, 각 원소는 3지선다 중 선택값)
  - `currentQuestionIndex: number`
  - `verdict: AiVerdict | null`
  - `isSubmitting: boolean` (스텝 5→6 전환 시 업로드+insert 진행 중)
  - `error: string | null` (AI 호출 실패 시)
- 인터랙션:
  - 스텝 1 "다음": 필수 필드 검증 → 통과 시 `questionLoading`로 전환 후 `ai-generate-questions` 호출 → 성공 시 `questions` 세팅 후 `questions` 스텝(0번째)으로 전환, 실패 시 에러 표시 + 스텝1 복귀(또는 재시도 버튼 — 확인 필요)
  - 질문별 옵션 선택 → `answers[currentQuestionIndex]` 갱신
  - "다음"(질문 1~4): `currentQuestionIndex + 1`. "다음"(질문 5, 5개 응답 완료): `verdictLoading` 전환 → `ai-generate-verdict` 호출 → 성공 시 `verdict` 세팅 후 `verdict` 스텝
  - "이전"(질문 1): `productInfo` 스텝으로 복귀(입력값 유지). "이전"(질문 2~5): `currentQuestionIndex - 1`
  - "24시간 고민 시작하기": `isSubmitting=true` → (이미지가 있으면) Storage 업로드 → `createWorry(...)`로 `worries` insert(`deadline_at = now + 24h`, `status: 'ongoing'`, `ai_questions`/`ai_answers`/`ai_verdict` 포함) → 성공 시 `timerStarted` 스텝, 실패 시 에러 토스트(피그마에 없는 상태 — 확인 필요)
  - "홈으로 돌아가기": 로컬 상태 폐기 후 즉시 `navigate(ROUTES.home)` (아무 것도 저장하지 않음)
  - "고민 목록으로 가기": `navigate(ROUTES.worries)`
- 필요 에셋/아이콘 (피그마 실측 크기 대조로 확정 — 위 "신규 에셋 3종 매칭" 참고):
  - `src/assets/cloud.svg`(184×146) → 질문 생성 로딩 + 판정 분석 로딩 화면 상단 일러스트
  - `src/assets/success.svg`(91×91) → AI 판정 결과 "긍정(필요한 소비)" 화면 상단 아이콘
  - `src/assets/danger.svg`(102×102) → AI 판정 결과 "부정(충동구매)" 화면 상단 아이콘
  - 이미지 업로드 카드의 빈 상태 아이콘은 위 3개와 매칭되지 않아 lucide-react `ImagePlus`(또는 `Upload`)로 대체 제안 — 확인 필요
  - lucide-react: `ChevronLeft`(이전 버튼), `ChevronDown`(카테고리 드롭다운), `X`(첨부 이미지 제거), `ImagePlus`(이미지 업로드 빈 상태), `Lightbulb`(AI가 이 질문을 하는 이유 — 기존 `src/assets/electric_bulb.svg`이 이미 다른 화면에서 쓰이고 있어 시각적 일관성 위해 lucide 아이콘 사용을 제안, 재사용 원하면 developer 재량으로 electric_bulb.svg로 교체 가능)
- 반응형 기준:
  - 상품 정보 스텝만 웹 실측(1511px 콘텐츠 폭 기준) 스펙이 있으므로, 마이페이지와 동일하게 `xl`(1024px) 이상에서 실측값에 가깝게, 그 미만은 비례 축소.
  - 나머지 5개 스텝(질문/로딩/판정/완료)은 모바일(390px) 목업만 있으므로, 그 레이아웃(세로 스택, 카드 중앙 정렬)을 기준으로 넓은 화면에서는 콘텐츠 폭을 `max-w-`로 제한하고 중앙 정렬하는 방식으로 반응형 적용(로그인/회원가입 웹 이슈 때와 동일하게, 전용 데스크톱 목업이 없는 화면은 "자연스럽게 확장되는 중앙 정렬 카드" 패턴을 따른다).
  - 페이지는 기존 `AppLayout`(사이드바 `lg` 이상, 미만은 `MobileTopBar`+`BottomNav`) 안에 위치 — 모바일 폭에서는 하단 `BottomNav`의 FAB(`NewWorryFab`)가 이미 이 라우트로 연결되어 있음(`src/components/layout/NewWorryFab.tsx`).

## `src/lib` 신규/변경 모듈 제안

- `src/lib/worries.ts`에 `createWorry` 추가:
  ```ts
  export interface CreateWorryInput {
    userId: string;
    name: string;
    price: number;
    category: string;
    purchaseUrl: string | null;
    thumbnailUrl: string | null;
    aiQuestions: { question: string; reason: string }[];
    aiAnswers: { question: string; answer: string }[];
    aiVerdict: AiVerdict;
  }
  export async function createWorry(input: CreateWorryInput): Promise<{ data: WorryRecord | null; error: string | null }>
  ```
  `deadline_at`은 함수 내부에서 `new Date(Date.now() + 24 * 60 * 60 * 1000)`으로 계산해 insert(`docs/plans/backend-setup.md` 확인 완료 사항 그대로 적용 — 이번이 실제 첫 사용처).
- `src/lib/worryThumbnails.ts`(신규): `uploadWorryThumbnail(userId: string, file: File): Promise<{ url: string | null; error: string | null }>` — Supabase Storage `worry-thumbnails` 버킷에 업로드 후 `getPublicUrl` 반환.
- `src/lib/aiWorryAssistant.ts`(신규): `generateWorryQuestions(input)`/`generateWorryVerdict(input)` — 각각 `supabase.functions.invoke('ai-generate-questions', { body })` / `supabase.functions.invoke('ai-generate-verdict', { body })` 래핑.
- `src/types/newWorry.ts`(신규): `AiQuestion`, `AiAnswer`, `AiVerdict` 등 공용 타입.

## 확인 완료 (사용자 승인)

1. **카테고리 전체 목록**: 가구·인테리어, 뷰티, 생활용품, 식품, 운동·건강, 전자기기, 취미, 패션, 기타 (총 9개, 드롭다운 옵션 순서도 이 순서대로).
2. **이미지 업로드 카드의 빈 상태 아이콘**: lucide-react `ImagePlus`로 대체한다.
3. **AI 호출 실패 시 UX**: 에러 토스트 + 재시도 버튼을 보여준다 (현재 스텝에 머무르며 재시도 가능).
4. **질문 "다음" 버튼 활성화 조건**: 현재 질문에 답변을 선택해야만 활성화된다(미응답 건너뛰기 불가).
5. **`worries` row insert 실패 시 UX**(스토리지 업로드 실패 포함): 스텝 5(판정 결과)에 그대로 머무르며 에러 토스트만 표시한다.
6. **AI 모델**: `gpt-4o-mini`로 확정.
7. **`ai_questions`/`ai_answers`/`ai_verdict`의 재노출**: 나중에 고민 상세 페이지에서 다시 보여줄 계획이 있다 — 계획대로 컬럼에 그대로 저장해둔다(이번 이슈에서 상세 조회 화면을 만들지는 않는다).
8. **이미지 미첨부 시 화면 표시**: 기존 회색 placeholder 표시 방식(`WorryListItem` 등에서 이미 쓰는 패턴) 그대로 두고, 추후 별도로 다시 다듬을 예정 — 이번 이슈에서 추가 작업 없음.

> 참고: 이전 초안에 있던 "부정 판정 제목 문구"(긍정/부정 제목이 동일하게 적힌 카피 오류) 확인 필요 항목은, `334` 클러스터에서 올바르게 작성된 사본("충동구매 가능성이 높아요")을 찾아 이번 조사로 해결되었다(위 "피그마 구조 분석 메모" 5번, "AI 판정 결과 스텝 상세" 참고).

## 작업 순서 제안 (developer 서브에이전트용)

1. Supabase 콘솔/CLI에서 `worries` 테이블에 `category`/`purchase_url`/`ai_questions`/`ai_answers`/`ai_verdict` 컬럼 추가, `worry-thumbnails` Storage 버킷 + RLS 정책 생성.
2. Supabase CLI로 Edge Function 2개(`ai-generate-questions`, `ai-generate-verdict`) 스캐폴딩·구현, `OPENAI_API_KEY`를 `supabase secrets set`으로 등록, `supabase functions deploy`로 배포.
3. `src/lib/aiWorryAssistant.ts`, `src/lib/worryThumbnails.ts`, `src/lib/worries.ts`(`createWorry`) 작성.
4. `src/types/newWorry.ts` 타입 정의.
5. `src/pages/NewWorry/useNewWorryFlow.ts` 상태 머신 훅 작성(6개 스텝 전환 로직).
6. `ProductInfoStep` 구현(웹 실측 스펙 그대로: 이미지 업로드 카드, 상품명/가격/카테고리/URL, "다음" 버튼 활성화 조건).
7. `QuestionGenLoadingStep`/`VerdictLoadingStep`(공용 `AiLoadingScreen`, `cloud.svg`) 구현.
8. `QuestionStep`(3지선다, 진행 표시, 이전/다음, AI가 이 질문을 하는 이유) 구현.
9. `VerdictResultStep`(`success.svg`/`danger.svg` 아이콘, 제목/설명, 3개 지표, 2개 버튼) 구현.
10. `TimerStartedStep`(완료 문구 + "고민 목록으로 가기") 구현.
11. `App.tsx`에 `ROUTES.newWorry` 라우트를 `ProtectedRoute` + `AppLayout` 하위에 추가.
12. "확인 필요" 답변 반영(카테고리 목록, 이미지 업로드 아이콘, 에러 UX 등).
13. 반응형 점검: 상품 정보 스텝은 `xl` 기준 실측값 vs 축소, 나머지 스텝은 중앙 정렬 카드 방식으로 좁은/넓은 화면 모두 확인.
14. 수동 검증: 전체 플로우(상품 정보 입력 → 질문 5개 응답 → AI 판정 → "24시간 고민 시작하기"로 실제 `worries` row + storage 파일 생성 확인 / "홈으로 돌아가기"로 아무 것도 저장되지 않는지 확인) End-to-End 테스트.
