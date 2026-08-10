// docs/plans/new-worry.md "Edge Function 설계 > 1. ai-generate-questions"
//
// 로그인 사용자가 입력한 상품 정보를 바탕으로, "필요한 소비인지 충동적인 소비인지 판단하기
// 위한" 질문 5개(+ 각 질문을 하는 이유)를 OpenAI(gpt-4o-mini)로 생성해 반환한다.
// OpenAI API 키는 이 함수(서버) 안에서만 사용하고 절대 프론트엔드로 노출하지 않는다.
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { requireAuthenticatedUser } from '../_shared/auth.ts';

interface RequestBody {
  name: string;
  price: number;
  category: string;
  purchaseUrl?: string;
}

interface AiQuestion {
  question: string;
  reason: string;
  options: string[];
}

const OPENAI_MODEL = 'gpt-4o-mini';
const QUESTION_COUNT = 5;
const OPTION_COUNT = 3;
// AI가 그 질문에 어울리는 선택지를 3개 못 채워준 경우를 대비한 방어용 기본값
// (프론트엔드 src/types/newWorry.ts의 QUESTION_ANSWER_OPTIONS와 동일한 문구로 맞춰둔다).
const FALLBACK_OPTIONS = ['네, 꼭 필요해요.', '있으면 좋을 거 같아요.', '잘 모르겠어요.'];

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: '허용되지 않은 메서드입니다.' }, 405);
  }

  const authResult = await requireAuthenticatedUser(req);
  if ('errorResponse' in authResult) {
    return authResult.errorResponse;
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return jsonResponse({ error: '잘못된 요청 본문입니다.' }, 400);
  }

  if (
    !body?.name ||
    typeof body.price !== 'number' ||
    Number.isNaN(body.price) ||
    !body?.category
  ) {
    return jsonResponse(
      { error: 'name, price, category는 필수 값입니다.' },
      400,
    );
  }

  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error('OPENAI_API_KEY가 설정되지 않았습니다.');
    return jsonResponse({ error: 'AI 질문 생성에 실패했습니다.' }, 502);
  }

  try {
    const questions = await generateQuestions(body, openaiApiKey);
    return jsonResponse({ questions }, 200);
  } catch (error) {
    console.error('ai-generate-questions 실패:', error);
    return jsonResponse({ error: 'AI 질문 생성에 실패했습니다.' }, 502);
  }
});

async function generateQuestions(
  input: RequestBody,
  apiKey: string,
): Promise<AiQuestion[]> {
  const priceLabel = `${input.price.toLocaleString('ko-KR')}원`;
  const purchaseUrlLine = input.purchaseUrl
    ? `\n- 구매 예정 사이트: ${input.purchaseUrl}`
    : '';

  const userPrompt = `사용자가 아래 상품 구매를 고민하고 있습니다.
- 상품명: ${input.name}
- 가격: ${priceLabel}
- 카테고리: ${input.category}${purchaseUrlLine}

이 사람이 이 물건을 "정말 필요해서" 사려는 것인지, 아니면 "충동적으로" 사려는 것인지
스스로 판단해볼 수 있도록 도와주는 질문을 정확히 ${QUESTION_COUNT}개 만들어주세요.
각 질문은 한국어로, 사용자에게 직접 묻는 존댓말 문장으로 작성하고(예: "이 물건이 정말 필요한
이유가 있나요?"), 질문마다 "이 질문을 왜 하는지"에 대한 짧은 이유(reason)를 함께 작성해주세요.

그리고 각 질문마다 그 질문에 자연스럽게 어울리는 답변 선택지를 정확히 ${OPTION_COUNT}개
(options)씩 함께 생성해주세요. 선택지는 고정된 문구를 재사용하지 말고 질문 내용에 맞게
자유롭게 작성하되, 사용자의 필요/충동 정도를 판단할 수 있도록 설계해야 합니다 — 예를 들어
"강하게 필요하다는 뉘앙스" / "있으면 좋지만 없어도 그만인 중간 뉘앙스" / "잘 모르겠다는
모호한 뉘앙스"처럼 서로 다른 3단계 톤을 담아주세요. 각 선택지는 한 문장의 존댓말로 작성하고,
사용자가 클릭 한 번으로 고를 수 있는 짧은 문구여야 합니다.`;

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        {
          role: 'system',
          content:
            '당신은 충동구매를 줄이도록 돕는 소비 코치입니다. 사용자가 냉정하게 스스로를 돌아볼 수 있는, 친절하지만 핵심을 찌르는 질문을 만듭니다.',
        },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'worry_questions',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              questions: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    question: { type: 'string' },
                    reason: { type: 'string' },
                    options: {
                      type: 'array',
                      items: { type: 'string' },
                    },
                  },
                  required: ['question', 'reason', 'options'],
                  additionalProperties: false,
                },
              },
            },
            required: ['questions'],
            additionalProperties: false,
          },
        },
      },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API 오류(${response.status}): ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error('OpenAI 응답에 content가 없습니다.');
  }

  const parsed = JSON.parse(content) as { questions: AiQuestion[] };
  if (!Array.isArray(parsed.questions) || parsed.questions.length < QUESTION_COUNT) {
    throw new Error('OpenAI가 질문을 충분히 생성하지 못했습니다.');
  }

  return parsed.questions.slice(0, QUESTION_COUNT).map((q) => ({
    ...q,
    options: normalizeOptions(q.options),
  }));
}

/** AI가 선택지를 OPTION_COUNT개보다 적게/많이 주거나 비워서 준 경우를 방어한다.
 * 부족한 자리는 고정 문구(FALLBACK_OPTIONS)로 채워 프론트엔드가 항상 3개를 받도록 보장한다. */
function normalizeOptions(options: unknown): string[] {
  const valid = Array.isArray(options)
    ? options.filter((option): option is string => typeof option === 'string' && option.length > 0)
    : [];

  if (valid.length >= OPTION_COUNT) {
    return valid.slice(0, OPTION_COUNT);
  }

  const padded = [...valid];
  for (let i = valid.length; i < OPTION_COUNT; i++) {
    padded.push(FALLBACK_OPTIONS[i] ?? FALLBACK_OPTIONS[FALLBACK_OPTIONS.length - 1]);
  }
  return padded;
}
