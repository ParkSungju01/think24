// docs/plans/new-worry.md "Edge Function 설계 > 2. ai-generate-verdict"
//
// 상품 정보 + 사용자가 5개 질문에 답한 내용을 종합해 "필요한 소비 / 충동구매" 참고용 판정과
// 3개 지표(필요성/충동성/가격 적정성)를 OpenAI(gpt-4o-mini)로 생성해 반환한다.
// 이슈 #48(docs/plans/local-only-migration.md): 로그인 인증 체크는 제거하고, 비로그인 상태의
// 무제한 호출을 막기 위해 IP 기준 rate limit(10분/5회)으로 대체했다.
import { corsHeaders, jsonResponse } from '../_shared/cors.ts';
import { checkRateLimit, getClientIp } from '../_shared/rateLimit.ts';

interface AnswerInput {
  question: string;
  reason: string;
  answer: string;
}

interface RequestBody {
  name: string;
  price: number;
  category: string;
  purchaseUrl?: string;
  answers: AnswerInput[];
}

type Verdict = 'necessary' | 'unnecessary';

interface Score {
  percent: number;
  label: string;
}

interface AiVerdictResponse {
  verdict: Verdict;
  title: string;
  description: string;
  scores: {
    necessity: Score;
    impulsiveness: Score;
    priceFit: Score;
  };
}

const OPENAI_MODEL = 'gpt-4o-mini';
const ANSWER_COUNT = 5;

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return jsonResponse({ error: '허용되지 않은 메서드입니다.' }, 405);
  }

  const ip = getClientIp(req);
  const rateLimitResult = checkRateLimit(ip);
  if (!rateLimitResult.allowed) {
    return jsonResponse(
      { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
      429,
    );
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
    !body?.category ||
    !Array.isArray(body.answers) ||
    body.answers.length < ANSWER_COUNT
  ) {
    return jsonResponse(
      { error: 'name, price, category, answers(5개)는 필수 값입니다.' },
      400,
    );
  }

  const openaiApiKey = Deno.env.get('OPENAI_API_KEY');
  if (!openaiApiKey) {
    console.error('OPENAI_API_KEY가 설정되지 않았습니다.');
    return jsonResponse({ error: 'AI 분석에 실패했습니다.' }, 502);
  }

  try {
    const verdict = await generateVerdict(body, openaiApiKey);
    return jsonResponse(verdict, 200);
  } catch (error) {
    console.error('ai-generate-verdict 실패:', error);
    return jsonResponse({ error: 'AI 분석에 실패했습니다.' }, 502);
  }
});

async function generateVerdict(
  input: RequestBody,
  apiKey: string,
): Promise<AiVerdictResponse> {
  const priceLabel = `${input.price.toLocaleString('ko-KR')}원`;
  const purchaseUrlLine = input.purchaseUrl
    ? `\n- 구매 예정 사이트: ${input.purchaseUrl}`
    : '';
  const qaLines = input.answers
    .slice(0, ANSWER_COUNT)
    .map(
      (qa, index) =>
        `${index + 1}. 질문: ${qa.question}\n   답변: ${qa.answer}`,
    )
    .join('\n');

  const userPrompt = `사용자가 아래 상품 구매를 고민하고 있고, 5개 질문에 답변했습니다.
- 상품명: ${input.name}
- 가격: ${priceLabel}
- 카테고리: ${input.category}${purchaseUrlLine}

질문/답변:
${qaLines}

이 답변들을 종합해 이 구매가 "필요한 소비"인지 "충동구매 가능성이 높은 소비"인지 판정해주세요.
- verdict: 필요한 소비면 "necessary", 충동구매 가능성이 높으면 "unnecessary"
- title: 판정 결과를 한 문장으로. necessary면 "이 물건은 필요한 소비로 보여요"처럼, unnecessary면
  "충동구매 가능성이 높아요"처럼 작성
- description: 2문장 내외로, 24시간 동안 다시 생각해볼 것을 권하는 부드러운 톤의 설명
- scores: necessity(필요성)/impulsiveness(충동성)/priceFit(가격 적정성) 3개 지표를 각각
  0~100 사이의 percent와 "높음"/"보통"/"낮음" 중 하나의 label로 평가`;

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
            '당신은 충동구매를 줄이도록 돕는 소비 코치입니다. 사용자의 답변을 근거로 공정하고 일관된 판정을 내립니다.',
        },
        { role: 'user', content: userPrompt },
      ],
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'worry_verdict',
          strict: true,
          schema: {
            type: 'object',
            properties: {
              verdict: { type: 'string', enum: ['necessary', 'unnecessary'] },
              title: { type: 'string' },
              description: { type: 'string' },
              scores: {
                type: 'object',
                properties: {
                  necessity: {
                    type: 'object',
                    properties: {
                      percent: { type: 'number' },
                      label: { type: 'string' },
                    },
                    required: ['percent', 'label'],
                    additionalProperties: false,
                  },
                  impulsiveness: {
                    type: 'object',
                    properties: {
                      percent: { type: 'number' },
                      label: { type: 'string' },
                    },
                    required: ['percent', 'label'],
                    additionalProperties: false,
                  },
                  priceFit: {
                    type: 'object',
                    properties: {
                      percent: { type: 'number' },
                      label: { type: 'string' },
                    },
                    required: ['percent', 'label'],
                    additionalProperties: false,
                  },
                },
                required: ['necessity', 'impulsiveness', 'priceFit'],
                additionalProperties: false,
              },
            },
            required: ['verdict', 'title', 'description', 'scores'],
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

  return JSON.parse(content) as AiVerdictResponse;
}
