import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchNickname } from '../../lib/profiles';
import { fetchRecentWorries } from '../../lib/worries';
import {
  computeCategoryCounts,
  computeOngoingWorries,
  startOfPreviousMonth,
} from '../../lib/worrySummary';
import { pickTodayQuote } from '../../lib/todayQuote';
import type { HomeData } from '../../types/home';

interface UseHomeDataResult {
  data: HomeData | null;
  isLoading: boolean;
  error: string | null;
}

/** worries 조회 + 집계를 결합해 HomePage가 바로 쓸 수 있는 HomeData로 조립한다 */
export function useHomeData(): UseHomeDataResult {
  const { user } = useAuth();
  const [data, setData] = useState<HomeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // ProtectedRoute가 로그인된 상태에서만 HomePage를 렌더링하므로 실질적으로는
    // 항상 user가 있지만, 방어적으로 없으면 조회를 건너뛴다.
    if (!user) {
      return;
    }

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);

      try {
        const now = new Date();
        const emailPrefix = user.email?.split('@')[0] ?? '';
        // profiles 테이블에 닉네임이 없는 경우(테이블 생성 이전 계정 등)를 대비해
        // 조회 실패/데이터 없음이면 이메일 @ 앞부분으로 폴백한다.
        const nickname = await fetchNickname(user.id);
        const worries = await fetchRecentWorries(
          user.id,
          startOfPreviousMonth(now),
        );
        const monthlySummary = computeCategoryCounts(worries, now);
        const ongoingWorries = computeOngoingWorries(worries, now);
        // 개수 관련 필드는 monthlySummary와 동일한 집계 결과를 재사용한다(중복 계산 방지)
        const abandonedCount =
          monthlySummary.find((stat) => stat.key === 'abandoned')?.count ?? 0;
        const purchasedCount =
          monthlySummary.find((stat) => stat.key === 'purchased')?.count ?? 0;

        if (cancelled) return;

        setData({
          userName: nickname ?? emailPrefix,
          // 보류: "절약 금액"의 정확한 정의가 아직 결정되지 않아 하드코딩 유지
          // (docs/plans/backend-setup.md 보류 섹션 참고 — 실제 로직 연결 금지)
          totalSavedAmount: 0,
          monthlySavedAmount: 0,
          savedAmountAbandonedCount: abandonedCount,
          savedAmountPurchasedCount: purchasedCount,
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
  }, [user]);

  return { data, isLoading, error };
}
