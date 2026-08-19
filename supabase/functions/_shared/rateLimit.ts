// docs/plans/local-only-migration.md "AI 관련 변경 > Edge Function": 로그인 인증 체크를
// 제거한 뒤, 비로그인 상태에서도 OpenAI 비용이 무한정 소모되지 않도록 IP 기준 인메모리
// 슬라이딩 윈도우 rate limit을 둔다. ai-generate-questions/ai-generate-verdict가 각각
// 독립적으로 import해서 쓴다(두 함수는 별도 Deno 인스턴스로 배포되므로 메모리를 공유할 수
// 없어, 제한은 함수(엔드포인트)별로 각각 적용된다).

const WINDOW_MS = 10 * 60 * 1000; // 10분
const MAX_REQUESTS_PER_WINDOW = 5; // IP당, 함수(엔드포인트)별로 각각 적용

const requestLog = new Map<string, number[]>(); // ip -> timestamps(ms)

export function checkRateLimit(ip: string): {
  allowed: boolean;
  retryAfterSeconds: number;
} {
  const now = Date.now();
  const timestamps = (requestLog.get(ip) ?? []).filter(
    (t) => now - t < WINDOW_MS,
  );

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
