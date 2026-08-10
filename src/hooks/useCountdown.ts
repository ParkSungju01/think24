import { useEffect, useState } from 'react';

function computeRemaining(target: number | null): number {
  return target ? Math.max(0, Math.ceil((target - Date.now()) / 1000)) : 0;
}

/**
 * 목표 시각(ms epoch)까지 남은 초를 1초 간격으로 갱신해 반환한다.
 * - 로그인 5회 실패 제한(10분)과 회원가입 이메일 인증코드 카운트다운(5분)에서 공용으로 사용.
 * - target이 null이면 카운트다운을 하지 않고 0을 반환한다.
 */
export function useCountdown(target: number | null): number {
  const [prevTarget, setPrevTarget] = useState(target);
  const [remaining, setRemaining] = useState(() => computeRemaining(target));

  // target이 바뀌면(새 타이머 시작 등) 렌더링 중 즉시 값을 다시 계산한다
  // (react-hooks/set-state-in-effect 회피: effect 안에서 동기적으로 setState하지 않는
  // "렌더링 중 상태 조정" 공식 패턴 — https://react.dev/learn/you-might-not-need-an-effect)
  if (target !== prevTarget) {
    setPrevTarget(target);
    setRemaining(computeRemaining(target));
  }

  useEffect(() => {
    if (!target) return;
    // setInterval 콜백 안에서의 setState는 "외부 시스템 구독" 패턴이라 문제 없다
    const intervalId = window.setInterval(() => {
      setRemaining(computeRemaining(target));
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [target]);

  return remaining;
}
