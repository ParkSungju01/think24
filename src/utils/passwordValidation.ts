export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;

/** 영문 대/소문자, 숫자, 특수문자 중 3종 이상 조합 + 8~20자 (명세 2-4) */
export function isPasswordStrongEnough(password: string): boolean {
  if (
    password.length < PASSWORD_MIN_LENGTH ||
    password.length > PASSWORD_MAX_LENGTH
  ) {
    return false;
  }
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^a-zA-Z0-9]/];
  const matchedClassCount = classes.filter((pattern) =>
    pattern.test(password),
  ).length;
  return matchedClassCount >= 3;
}

/**
 * 비밀번호 입력값의 실시간 에러 메시지를 반환한다. 유효하면 null.
 * email이 주어지면 "이메일과 동일한 비밀번호 금지" 규칙(명세 2-4)도 함께 검사한다.
 */
export function getPasswordError(
  password: string,
  email?: string,
): string | null {
  if (password.length === 0) return null;
  if (email && password.toLowerCase() === email.trim().toLowerCase()) {
    return '이메일과 동일한 문자열은 비밀번호로 사용할 수 없습니다.';
  }
  if (!isPasswordStrongEnough(password)) {
    return '영문 대소문자, 숫자, 특수문자를 포함해 8~20자로 입력해 주세요.';
  }
  return null;
}
