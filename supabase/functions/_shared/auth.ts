import { createClient } from 'jsr:@supabase/supabase-js@2';

/**
 * 계획서(docs/plans/new-worry.md) Edge Function 설계: 비로그인 요청이 OpenAI 비용을
 * 소모하지 않도록, 요청의 Authorization 헤더(JWT)로 실제 로그인 사용자인지 검증한다.
 * `supabase.functions.invoke()`는 세션이 있으면 access token을, 없으면 anon key를
 * Authorization 헤더에 싣는데 anon key만으로는 `auth.getUser()`가 유저를 반환하지 않으므로
 * 이 검사 하나로 "로그인 세션으로 호출했는지"까지 함께 검증된다.
 */
export async function requireAuthenticatedUser(
  req: Request,
): Promise<{ userId: string } | { errorResponse: Response }> {
  const authHeader = req.headers.get('Authorization');
  if (!authHeader) {
    return {
      errorResponse: unauthorizedResponse(),
    };
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY');
  if (!supabaseUrl || !supabaseAnonKey) {
    return {
      errorResponse: new Response(
        JSON.stringify({ error: '서버 설정 오류입니다.' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } },
      ),
    };
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { errorResponse: unauthorizedResponse() };
  }

  return { userId: user.id };
}

function unauthorizedResponse(): Response {
  return new Response(JSON.stringify({ error: '로그인이 필요합니다.' }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}
