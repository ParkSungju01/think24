/**
 * Supabase에는 "사전 이메일 중복확인" 기능이 없어 mock 처리한다 (사용자 확인 완료).
 * 최종 검증은 어차피 실제 가입하기(signUp) 호출 시 Supabase가 수행하므로,
 * 여기서는 항상 "사용 가능"으로 응답해 화면 흐름만 재현한다.
 *
 * 참고: 이메일 인증코드(OTP) mock은 구현 중 범위 변경으로 제외됐다
 * (docs/plans/login-signup.md "구현 중 범위 변경" 참고).
 */

export function checkEmailAvailability(): Promise<'available'> {
  return new Promise((resolve) => {
    window.setTimeout(() => resolve('available'), 500);
  });
}
