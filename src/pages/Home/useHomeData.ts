import { useEffect, useState } from 'react';
import { useNickname } from '../../contexts/NicknameContext';
import { fetchRecentWorries } from '../../lib/worries';
import {
  computeCategoryCounts,
  computeOngoingWorries,
  startOfPreviousMonth,
} from '../../lib/worrySummary';
import { pickTodayQuote } from '../../lib/todayQuote';
import { recordsMockByPeriod } from '../../mocks/records';
import type { HomeData } from '../../types/home';

interface UseHomeDataResult {
  data: HomeData | null;
  isLoading: boolean;
  error: string | null;
}

/** worries 조회 + 집계를 결합해 HomePage가 바로 쓸 수 있는 HomeData로 조립한다 */
export function useHomeData(): UseHomeDataResult {
  const { nickname } = useNickname();
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const now = new Date();
        const worries = await fetchRecentWorries(startOfPreviousMonth(now));
        const monthlySummary = computeCategoryCounts(worries, now);
        const ongoingWorries = computeOngoingWorries(worries, now);

        if (cancelled) return;

        setData({
          // userName은 아래 반환값에서 NicknameContext의 nickname으로 매번 덮어써진다(placeholder).
          // 닉네임은 전역 Context가 동기적으로 보관하므로, 여기서는 worries 등 이 화면 고유
          // 데이터만 fetch한다 — 마이페이지에서 닉네임을 바꾸면 worries를 다시 불러오지 않고도
          // 즉시 반영된다.
          userName: '',
          // 소비기록(/records) 화면과 동일한 정적 mock 수치를 그대로 재사용한다(사용자 요청:
          // 홈 화면 "지금까지 절약한 금액"이 소비기록 데이터와 맞아야 함). "지금까지"는 소비기록의
          // "전체" 기간, "이번 달 + N원" 배지는 소비기록의 "이번 달" 기간 금액과 대응시킨다.
          totalSavedAmount: recordsMockByPeriod.all.savingsAmount,
          monthlySavedAmount: recordsMockByPeriod.thisMonth.savingsAmount,
          // 포기/구매 개수도 실제 로컬 worries 집계 대신 소비기록 "전체" 기간 mock 수치와
          // 맞춘다(사용자 요청 — 위 절약 금액과 동일한 근거).
          savedAmountAbandonedCount: recordsMockByPeriod.all.abandonedCount,
          savedAmountPurchasedCount: recordsMockByPeriod.all.purchasedCount,
          ongoingWorries,
          monthlySummary,
          todayQuote: pickTodayQuote(now),
        });
      } catch (err) {
        if (cancelled) return;
        setError(
          err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.',
        );
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return {
    data: data ? { ...data, userName: nickname } : null,
    isLoading,
    error,
  };
}
