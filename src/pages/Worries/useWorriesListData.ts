import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
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
 * docs/plans/worries-list.md "화면 구성 > 화면 1" 상태/데이터 설계 그대로. 데이터 로드(로컬
 * localStorage 조회 1회) + 로컬 오버레이 3종(일시정지/재개 표시용 마감/확정) + 삭제 오버레이 +
 * 필터/더보기/모달 타깃 상태 + 파생값 계산까지 한 훅에 모아 WorriesPage를 얇게 유지한다.
 *
 * ADR-0004: 확정(구매/포기)·일시정지·삭제는 전부 이 훅의 로컬 useState로만 존재하고 실제 저장소에는
 * 쓰지 않는다 — 새로고침하면 초기화된다.
 */
export function useWorriesListData() {
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
  // 결정 시트의 "구매하기" → 바로 확정하지 않고 재확인 모달을 하나 더 띄운다. 결정 시트
  // 자체는 열어둔 채로 유지해, 재확인 모달에서 "조금 더 고민하기"를 누르면 결정 시트로
  // 돌아가 다시 포기/구매를 고를 수 있게 한다.
  const [purchaseConfirmTarget, setPurchaseConfirmTarget] = useState<
    string | null
  >(null);

  // 알림 클릭 → "?highlight=<worryId>"로 진입했을 때 해당 고민이 속한 필터로 전환하고
  // 카드를 잠깐 강조 표시하기 위한 상태. searchParams는 처리 즉시 지워서(replace) 새로고침/뒤로가기
  // 시 같은 처리가 반복되지 않게 한다.
  const [searchParams, setSearchParams] = useSearchParams();
  const [highlightedWorryId, setHighlightedWorryId] = useState<string | null>(
    null,
  );
  const [highlightError, setHighlightError] = useState<string | null>(null);

  const now = useNowTick();

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const result = await fetchOngoingWorries();
        if (cancelled) return;
        setWorries(result);

        // "?highlight=<id>" 처리는 데이터 로드가 끝난 직후(이 async 콜백 안) 한 번만 수행한다.
        // 아직 컴포넌트 state로 반영되지 않은 방금 조회한 result를 직접 써서, 상태 갱신을 한 차례
        // 더 기다렸다가 처리하는 별도 effect 없이 바로 처리한다(오버레이가 전부 비어있는 최초
        // 로드 시점이라 deriveWorryListViews를 빈 오버레이로 호출해도 실제 상태와 동일하다).
        const highlightId = searchParams.get('highlight');
        if (highlightId) {
          setSearchParams(
            (prev) => {
              const next = new URLSearchParams(prev);
              next.delete('highlight');
              return next;
            },
            { replace: true },
          );

          const loadedViews = deriveWorryListViews(
            result,
            new Date(),
            {},
            {},
            {},
            new Set(),
          );
          const target = loadedViews.find(
            (view) => view.worry.id === highlightId,
          );
          if (!target) {
            setHighlightError('이미 처리되었거나 삭제된 고민이에요.');
          } else {
            setFilterState(target.status);
            const targetIndex = sortByRemainingTime(
              filterWorryListViews(loadedViews, target.status),
            ).findIndex((view) => view.worry.id === highlightId);
            setVisibleCount(
              targetIndex === -1
                ? DEFAULT_VISIBLE_COUNT
                : Math.max(DEFAULT_VISIBLE_COUNT, targetIndex + 1),
            );
            setHighlightedWorryId(highlightId);
          }
        }
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
    // 마운트 시 1회만 실행한다(searchParams/setSearchParams는 이 시점의 초기 URL만 참조하면 된다).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // 강조 표시는 잠깐만 유지한다(카드 스타일 참고).
  useEffect(() => {
    if (!highlightedWorryId) return;
    const timer = setTimeout(() => setHighlightedWorryId(null), 2000);
    return () => clearTimeout(timer);
  }, [highlightedWorryId]);

  const dismissHighlightError = useCallback(() => {
    setHighlightError(null);
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
      setPurchaseConfirmTarget(null);
    },
    [],
  );

  const openPurchaseConfirm = useCallback((id: string) => {
    setPurchaseConfirmTarget(id);
  }, []);

  const closePurchaseConfirm = useCallback(() => {
    setPurchaseConfirmTarget(null);
  }, []);

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
  const purchaseConfirmWorry =
    worries.find((worry) => worry.id === purchaseConfirmTarget) ?? null;

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
    openPurchaseConfirm,
    closePurchaseConfirm,
    purchaseConfirmWorry,
    highlightedWorryId,
    highlightError,
    dismissHighlightError,
  };
}
