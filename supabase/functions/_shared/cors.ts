// 두 AI 프록시 함수(ai-generate-questions/ai-generate-verdict)가 공유하는 CORS 헤더.
// 브라우저(supabase-js `functions.invoke`)에서 직접 호출하므로 프리플라이트(OPTIONS) 응답과
// 실제 응답 모두에 필요하다.
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

export function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}
