import { useEffect } from 'react';

interface ToastProps {
  message: string;
  tone: 'success' | 'error';
  /** 자동으로 사라질 때 호출 (호출부가 상태를 null로 되돌려 언마운트) */
  onDismiss: () => void;
  /** 자동으로 사라지기까지의 시간(ms) */
  durationMs?: number;
}

const TONE_CLASSNAME: Record<ToastProps['tone'], string> = {
  success: 'bg-[#4fb75b] text-white',
  error: 'bg-[#e05b4e] text-white',
};

/**
 * docs/plans/mypage.md 확인 완료 2번: 마이페이지 닉네임 저장 성공/실패를 인라인 텍스트가 아니라
 * 화면 상단에 잠깐 나타났다 자동으로 사라지는 토스트로 보여준다. 피그마에 없는 신규 UI라 이 프로젝트의
 * 확정 팔레트(성공 #4fb75b / 에러 #e05b4e)만 재사용해 톤을 구분했다.
 *
 * 이슈 #39: fixed(브라우저 뷰포트 기준) → absolute(PhoneFrame 스크린 영역 기준)로 전환
 * (docs/plans/landing-phone-refactor.md 2-6) — PhoneFrame의 스크린 div가 relative
 * 포지셔닝 컨텍스트라 그 안에서 상단에 뜬다.
 */
export function Toast({ message, tone, onDismiss, durationMs = 2500 }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, durationMs);
    return () => clearTimeout(timer);
  }, [onDismiss, durationMs]);

  return (
    <div
      role="status"
      aria-live="polite"
      className="absolute inset-x-0 top-6 z-50 flex justify-center px-4"
    >
      <div
        className={`rounded-xl px-5 py-3 text-[14px] font-medium shadow-[0px_4px_16px_0px_rgba(0,0,0,0.15)] ${TONE_CLASSNAME[tone]}`}
      >
        {message}
      </div>
    </div>
  );
}
