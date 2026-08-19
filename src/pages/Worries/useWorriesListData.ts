import { useCallback, useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { fetchOngoingWorries, type WorryRecord } from '../../lib/worries';
import {
  countWorryListViews,
  deriveWorryListViews,
  filterWorryListViews,
  findMostUrgentView,
  sortByRemainingTime,
} from '../../lib/worryListDerive';
import { useNowTick } from '../../hooks/useNowTick';
import type {
  OutcomeOverlay,
  PausedOverlay,
  WorryListFilter,
} from '../../types/worriesList';

const DEFAULT_VISIBLE_COUNT = 2;

/**
 * docs/plans/worries-list.md "화면 구성 > 화면 1" 상태/데이터 설계 그대로. 데이터 로드(실제
 * Supabase 조회 1회) + 로컬 오버레이 3종(일시정지/재개 표시용 마감/확정) + 삭제 오버레이 +
 * 필터/더보기/모달 타깃 상태 + 파생값 계산까지 한 훅에 모아 WorriesPage를 얇게 유지한다.
 *
 * ADR-0004: 확정(구매/포기)·일시정지·삭제는 전부 이 훅의 로컬 useState로만 존재하고 실제 DB에는
 * 쓰지 않는다 — 새로고침하면 초기화된다.
 */
export function useWorriesListData() {
  const { user } = useAuth();
  const [worries, setWorries] = useState<WorryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [pausedOverlays, setPausedOverlays] = useState<
    Record<string, PausedOverlay>
  >({});
  const [resumedDisplayDeadlines, setResumedDisplayDeadlines] = useState<
    Record<string, number>
  >({});
  const [outcomeOverlays, setOutcomeOverlays] = useState<
    Record<string, OutcomeOverlay>
  >({});
  const [deletedIds, setDeletedIds] = useState<Set<string>>(new Set());

  const [filter, setFilterState] = useState<WorryListFilter>('all');
  const [visibleCount, setVisibleCount] = useState(DEFAULT_VISIBLE_COUNT);
  const [decisionSheetTarget, setDecisionSheetTarget] = useState<
    string | null
  >(null);
  const [deleteModalTarget, setDeleteModalTarget] = useState<string | null>(
    null,
  );

  const now = useNowTick();

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchOngoingWorries(user.id);
        if (cancelled) return;
        setWorries(result);
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

  const views = useMemo(
    () =>
      deriveWorryListViews(
        worries,
        now,
        pausedOverlays,
        resumedDisplayDeadlines,
        outcomeOverlays,
        deletedIds,
      ),
    [worries, now, pausedOverlays, resumedDisplayDeadlines, outcomeOverlays, deletedIds],
  );

  const counts = useMemo(() => countWorryListViews(views), [views]);

  const filteredViews = useMemo(
    () => sortByRemainingTime(filterWorryListViews(views, filter)),
    [views, filter],
  );

  const visibleViews = useMemo(
    () => filteredViews.slice(0, visibleCount),
    [filteredViews, visibleCount],
  );

  const hiddenCount = Math.max(0, filteredViews.length - visibleCount);

  // "가장 급한 항목" — all/ongoing 필터의 요약 카드 보조문구용. filteredViews는 all일 때
  // views 전체와 같으므로, 두 필터 모두 이 하나의 값으로 커버된다.
  const mostUrgentView = useMemo(
    () => findMostUrgentView(filteredViews),
    [filteredViews],
  );

  // "보류 중인 금액" — 현재 필터와 무관하게 목록에 남아있는(아직 확정/삭제되지 않은) 전체
  // worry의 가격 합. 필터 칩 클릭으로 이 총액이 바뀌지 않는다(피그마 헤더 총액은 필터 전환에도
  // 고정, 보조문구 한 줄만 필터별로 갈림).
  const totalPendingAmount = useMemo(
    () => views.reduce((sum, view) => sum + view.worry.price, 0),
    [views],
  );

  const setFilter = useCallback((nextFilter: WorryListFilter) => {
    setFilterState(nextFilter);
    setVisibleCount(DEFAULT_VISIBLE_COUNT);
  }, []);

  const loadMore = useCallback(() => {
    setVisibleCount(filteredViews.length);
  }, [filteredViews.length]);

  const pauseWorry = useCallback(
    (id: string) => {
      const target = views.find((view) => view.worry.id === id);
      if (!target || target.status !== 'ongoing') return;

      setPausedOverlays((prev) => ({
        ...prev,
        [id]: {
          pausedAt: Date.now(),
          remainingSecondsSnapshot: target.displayRemainingSeconds,
        },
      }));
      setResumedDisplayDeadlines((prev) => {
        if (!(id in prev)) return prev;
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [views],
  );

  const resumeWorry = useCallback(
    (id: string) => {
      const overlay = pausedOverlays[id];
      if (!overlay) return;

      setResumedDisplayDeadlines((prev) => ({
        ...prev,
        [id]: Date.now() + overlay.remainingSecondsSnapshot * 1000,
      }));
      setPausedOverlays((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    },
    [pausedOverlays],
  );

  const openDecisionSheet = useCallback((id: string) => {
    setDecisionSheetTarget(id);
  }, []);

  const closeDecisionSheet = useCallback(() => {
    setDecisionSheetTarget(null);
  }, []);

  const decideOutcome = useCallback(
    (id: string, outcome: OutcomeOverlay['outcome']) => {
      setOutcomeOverlays((prev) => ({
        ...prev,
        [id]: { outcome, decidedAt: Date.now() },
      }));
      setDecisionSheetTarget(null);
    },
    [],
  );

  const openDeleteModal = useCallback((id: string) => {
    setDeleteModalTarget(id);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeleteModalTarget(null);
  }, []);

  const confirmDelete = useCallback((id: string) => {
    setDeletedIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
    setDeleteModalTarget(null);
  }, []);

  const decisionSheetWorry =
    worries.find((worry) => worry.id === decisionSheetTarget) ?? null;
  const deleteModalWorry =
    worries.find((worry) => worry.id === deleteModalTarget) ?? null;

  return {
    isLoading,
    error,
    filter,
    setFilter,
    counts,
    filteredViews,
    visibleViews,
    hiddenCount,
    loadMore,
    mostUrgentView,
    totalPendingAmount,
    pauseWorry,
    resumeWorry,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    deleteModalWorry,
    openDecisionSheet,
    closeDecisionSheet,
    decideOutcome,
    decisionSheetWorry,
  };
}
