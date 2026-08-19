import { useEffect, useState } from 'react';

/**
 * docs/plans/worries-list.md "파생 로직" 4번째 항목: 1초 간격으로 "지금"을 갱신해, 진행 중
 * 카드가 결정 대기로 자동 전환되는 시점에 필터 칩 개수/요약 카드도 함께 갱신되게 한다.
 * (개별 카드 내부 숫자 갱신은 각 카드의 useCountdown이 담당 — 책임 분리)
 */
export function useNowTick(): Date {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNow(new Date());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  return now;
}
