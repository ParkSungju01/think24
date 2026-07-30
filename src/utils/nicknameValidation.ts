// 회원가입(SignUp)/마이페이지(MyPage) 공용 닉네임 검증 규칙 (docs/plans/mypage.md 확인 완료 1번:
// 회원가입 화면에 있던 검증 로직을 이 파일로 추출해 두 화면에서 재사용한다)
export const NICKNAME_REGEX = /^[가-힣a-zA-Z0-9]{2,10}$/;

// 금칙어 필터는 mock 수준의 예시 목록이다 (욕설/운영자 사칭 등, 명세 2-1)
const BANNED_NICKNAME_WORDS = [
  '관리자',
  '운영자',
  'admin',
  'administrator',
  '시발',
  '씨발',
  '병신',
  '좆같',
  '존나',
];

/**
 * 닉네임 형식/금칙어를 검증해 에러 문구를 반환한다.
 * 빈 값은 에러로 취급하지 않는다(입력 전 상태 vs 형식 오류 상태를 구분해야 하는 호출부에서
 * 별도로 처리 — 예: 마이페이지의 "빈 값"/"형식 오류" 테두리 색상 분기).
 */
export function getNicknameError(nickname: string): string | null {
  if (nickname.length === 0) return null;
  if (!NICKNAME_REGEX.test(nickname)) {
    return '2~10자의 한글/영문/숫자만 사용할 수 있습니다.';
  }
  const lower = nickname.toLowerCase();
  if (
    BANNED_NICKNAME_WORDS.some((word) => lower.includes(word.toLowerCase()))
  ) {
    return '사용할 수 없는 닉네임입니다.';
  }
  return null;
}
