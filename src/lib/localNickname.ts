// docs/plans/local-only-migration.md "2. 닉네임 로컬 스토어": profiles.ts(Supabase) 대신
// localStorage 하나로 닉네임을 보관하는 완전히 새 모듈. profiles.ts는 죽은 AuthContext가
// 계속 참조하므로 건드리지 않고, 살아있는 코드는 이 파일만 쓴다.

const NICKNAME_KEY = 'meomchit:nickname';

// 사용자가 마이페이지에서 바로 바꿀 수 있어 정확한 문구는 중요하지 않다(결정사항 3).
export const DEFAULT_NICKNAME = '사용자';

export function getNickname(): string {
  return window.localStorage.getItem(NICKNAME_KEY) ?? DEFAULT_NICKNAME;
}

export function setNickname(next: string): void {
  window.localStorage.setItem(NICKNAME_KEY, next);
}
