import type { WorryRecord } from './worries';
import type {
  DeletedWorryIds,
  OutcomeOverlay,
  PausedOverlay,
  WorryListView,
} from '../types/worriesList';

/**
 * docs/plans/worries-list.md "파생 로직" 그대로. status==='ongoing'인 실제 row들에
 * 로컬 오버레이(일시정지/확정/삭제/재개 표시용 마감)를 얹어 화면 표시용 파생 상태를 계산한다.
 *
 * 계획서의 제안 시그니처에는 없었지만, "재개" 시 표시용 새 마감(resumedDisplayDeadlines)이
 * 없으면 요약 카드의 "가장 급한 항목" 계산(전체 view를 훑어 displayRemainingSeconds가 가장
 * 작은 항목을 찾음)이 재개 직후 원본 deadlineAt 기준의 잘못된 값을 쓰게 된다. 파생값 전체가
 * 일관되게 정확한 잔여시간을 보도록 resumedDisplayDeadlines도 함께 받는다.
 */
export function deriveWorryListViews(
  worries: WorryRecord[],
  now: Date,
  pausedOverlays: Record<string, PausedOverlay>,
  resumedDisplayDeadlines: Record<string, number>,
  outcomeOverlays: Record<string, OutcomeOverlay>,
  deletedIds: DeletedWorryIds,
): WorryListView[] {
  const nowMs = now.getTime();

  return worries
    .filter((worry) => !outcomeOverlays[worry.id] && !deletedIds.has(worry.id))
    .map((worry): WorryListView => {
      const pausedOverlay = pausedOverlays[worry.id];
      if (pausedOverlay) {
        return {
          worry,
          status: 'paused',
          displayRemainingSeconds: pausedOverlay.remainingSecondsSnapshot,
          displayProgressPercent: computeProgressPercent(
            worry,
            pausedOverlay.remainingSecondsSnapshot,
          ),
          countdownTargetMs: null,
        };
      }

      const countdownTargetMs =
        resumedDisplayDeadlines[worry.id] ?? worry.deadlineAt.getTime();

      if (nowMs >= countdownTargetMs) {
        return {
          worry,
          status: 'pending',
          displayRemainingSeconds: 0,
          displayProgressPercent: 100,
          countdownTargetMs: null,
        };
      }

      const remainingSeconds = Math.max(
        0,
        Math.ceil((countdownTargetMs - nowMs) / 1000),
      );

      return {
        worry,
        status: 'ongoing',
        displayRemainingSeconds: remainingSeconds,
        displayProgressPercent: computeProgressPercent(worry, remainingSeconds),
        countdownTargetMs,
      };
    });
}

/** 등록~마감 전체 구간 대비 경과율(%). totalMs가 0 이하인 방어적인 경우엔 100%로 취급. */
function computeProgressPercent(
  worry: WorryRecord,
  remainingSeconds: number,
): number {
  const totalMs = worry.deadlineAt.getTime() - worry.createdAt.getTime();
  if (totalMs <= 0) return 100;

  const elapsedMs = totalMs - remainingSeconds * 1000;
  return Math.min(100, Math.max(0, (elapsedMs / totalMs) * 100));
}

export interface WorryListCounts {
  all: number;
  ongoing: number;
  paused: number;
  pending: number;
}

/** 필터 칩 라벨의 개수 표시용 집계. */
export function countWorryListViews(views: WorryListView[]): WorryListCounts {
  return {
    all: views.length,
    ongoing: views.filter((view) => view.status === 'ongoing').length,
    paused: views.filter((view) => view.status === 'paused').length,
    pending: views.filter((view) => view.status === 'pending').length,
  };
}

/** all/ongoing/paused/pending 필터에 맞춰 views를 좁힌다. */
export function filterWorryListViews(
  views: WorryListView[],
  filter: 'all' | 'ongoing' | 'paused' | 'pending',
): WorryListView[] {
  if (filter === 'all') return views;
  return views.filter((view) => view.status === filter);
}

/** 남은 시간 오름차순 정렬(동률이면 원래 배열 순서 유지 — Array#sort는 안정 정렬). */
export function sortByRemainingTime(views: WorryListView[]): WorryListView[] {
  return [...views].sort(
    (a, b) => a.displayRemainingSeconds - b.displayRemainingSeconds,
  );
}

/** "가장 급한 항목" — displayRemainingSeconds가 가장 작은 1건(동률이면 배열 순서상 첫 항목). */
export function findMostUrgentView(
  views: WorryListView[],
): WorryListView | null {
  if (views.length === 0) return null;
  return views.reduce((mostUrgent, view) =>
    view.displayRemainingSeconds < mostUrgent.displayRemainingSeconds
      ? view
      : mostUrgent,
  );
}
