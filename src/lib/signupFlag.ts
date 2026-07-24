// 가입 완료·목표 설정 화면(/signup/complete)은 회원가입 직후에만 자연스러운 화면이라,
// 로그인된 사용자가 URL을 직접 입력해 들어오는 것을 막기 위한 1회성 플래그 (사용자 확인 완료).
const SIGNUP_JUST_COMPLETED_KEY = 'meomchit:justSignedUp';

export function markSignupJustCompleted(): void {
  window.sessionStorage.setItem(SIGNUP_JUST_COMPLETED_KEY, '1');
}

/**
 * 플래그 존재 여부만 읽는다(제거하지 않음).
 * React 18 StrictMode는 개발 모드에서 마운트를 두 번 실행하므로, 마운트 시점에 곧바로
 * 제거(consume)하면 두 번째 마운트에서 플래그가 이미 사라져 오탐 리다이렉트가 발생한다.
 * 대신 이 화면을 벗어나는 두 액션(시작하기/나중에 설정)에서 명시적으로 clear한다.
 */
export function hasJustSignedUpFlag(): boolean {
  return window.sessionStorage.getItem(SIGNUP_JUST_COMPLETED_KEY) !== null;
}

export function clearSignupJustCompletedFlag(): void {
  window.sessionStorage.removeItem(SIGNUP_JUST_COMPLETED_KEY);
}
