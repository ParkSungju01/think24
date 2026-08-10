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

// 프론트엔드로 내려가는 최종 형태 — sentiment는 이 함수 내부에서만 쓰고 응답에는 포함하지
// 않는다(프론트 타입/렌더링을 그대로 유지하기 위한 설계 선택. 아래 generateQuestions 주석 참고).
interface AiQuestion {
  question: string;
  reason: string;
  options: string[];
}

type Sentiment = 'yes' | 'no' | 'unsure';

/** OpenAI가 만드는 원본 선택지 1개 — sentiment로 의미 범주를 강제한다. */
interface RawOption {
  sentiment?: unknown;
  text?: unknown;
}

interface RawQuestion {
  question: string;
  reason: string;
  options: RawOption[];
}

const OPENAI_MODEL = 'gpt-4o-mini';
const QUESTION_COUNT = 5;
// 선택지는 항상 yes/no/unsure 3개, 이 순서로 고정 노출한다.
const SENTIMENT_ORDER: Sentiment[] = ['yes', 'no', 'unsure'];
// AI가 특정 sentiment 선택지를 안 주거나 형식이 깨졌을 때의 방어용 기본값
// (프론트엔드 src/types/newWorry.ts의 QUESTION_ANSWER_OPTIONS와 동일한 톤으로 맞춰둔다).
const FALLBACK_TEXT_BY_SENTIMENT: Record<Sentiment, string> = {
  yes: '네, 꼭 필요해요.',
  no: '아니요, 필요 없어요.',
  unsure: '잘 모르겠어요.',
};

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

그리고 각 질문마다 답변 선택지를 정확히 3개(options) 생성해주세요. 3개는 각각 아래 세
의미 범주(sentiment)에 정확히 하나씩만 대응해야 하고, 절대 두 범주에 걸치듯 애매하게
쓰면 안 됩니다:
- "yes": 그 질문에 명확히 긍정/필요하다는 뜻으로 답하는 선택지
- "no": 그 질문에 명확히 부정/불필요하다는 뜻으로 답하는 선택지
- "unsure": 아직 판단이 서지 않는다는 불확실한 뜻의 선택지

각 선택지의 문구(text)는 질문 내용에 자연스럽게 어울리는 한국어 존댓말로 작성하되, 반드시
15자 내외의 짧고 간결한 문장으로 작성해주세요(예: "네, 자주 사용해요." 같은 톤 — "~것
같습니다" 같은 장황한 설명형 문장은 피해주세요). 고정된 문구를 재사용하지 말고 질문마다
새로 작성하고, 사용자가 클릭 한 번으로 고를 수 있는 짧은 문구여야 합니다.`;

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
                      items: {
                        type: 'object',
                        properties: {
                          sentiment: {
                            type: 'string',
                            enum: ['yes', 'no', 'unsure'],
                          },
                          text: { type: 'string' },
                        },
                        required: ['sentiment', 'text'],
                        additionalProperties: false,
                      },
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

  const parsed = JSON.parse(content) as { questions: RawQuestion[] };
  if (!Array.isArray(parsed.questions) || parsed.questions.length < QUESTION_COUNT) {
    throw new Error('OpenAI가 질문을 충분히 생성하지 못했습니다.');
  }

  // sentiment는 yes/no/unsure 범주를 강제하기 위한 내부용 필드일 뿐, 프론트엔드
  // AiQuestion 타입(options: string[])은 이번 변경 전과 동일하게 유지한다 — sentiment별
  // 순서(yes, no, unsure)로 정렬한 문구 배열만 최종 응답에 담는다.
  return parsed.questions.slice(0, QUESTION_COUNT).map((q) => ({
    question: q.question,
    reason: q.reason,
    options: normalizeOptions(q.options),
  }));
}

/**
 * AI가 만든 선택지 배열에서 sentiment(yes/no/unsure)별로 정확히 하나씩만 골라
 * SENTIMENT_ORDER 순서(yes, no, unsure)로 정렬한 문구 배열을 반환한다. 특정 sentiment가
 * 없거나, sentiment 값이 셋 중 하나가 아니거나, text가 비어있는 등 형식이 깨진 항목은
 * 무시하고 FALLBACK_TEXT_BY_SENTIMENT로 채워 항상 3개가 채워지도록 보장한다.
 */
function normalizeOptions(options: unknown): string[] {
  const rawList = Array.isArray(options) ? (options as RawOption[]) : [];

  const bySentiment = new Map<Sentiment, string>();
  for (const option of rawList) {
    const sentiment = option?.sentiment;
    const text = option?.text;
    const isValidSentiment =
      sentiment === 'yes' || sentiment === 'no' || sentiment === 'unsure';

    if (
      isValidSentiment &&
      typeof text === 'string' &&
      text.length > 0 &&
      !bySentiment.has(sentiment)
    ) {
      bySentiment.set(sentiment, text);
    }
  }

  return SENTIMENT_ORDER.map(
    (sentiment) => bySentiment.get(sentiment) ?? FALLBACK_TEXT_BY_SENTIMENT[sentiment],
  );
}
