// docs/plans/worries-list.md "데이터/타입 설계" 그대로.
import type { WorryRecord } from '../lib/worries';

export type WorryListFilter = 'all' | 'ongoing' | 'paused' | 'pending';

/** status==='ongoing'인 WorryRecord에 로컬 오버레이를 얹어 계산하는 화면 표시용 파생 상태.
 *  'confirmed'는 로컬로 구매/포기 확정된 것 — 리스트에서 완전히 제외되므로 화면엔 노출되지 않지만
 *  파생 계산 중간값으로만 쓰인다. */
export type WorryDerivedStatus = 'ongoing' | 'paused' | 'pending' | 'confirmed';

/** 일시정지 로컬 오버레이. 재개 시 remainingSecondsSnapshot으로 표시용 마감을 다시 계산한다. */
export interface PausedOverlay {
  pausedAt: number; // epoch ms
  remainingSecondsSnapshot: number;
}

/** 확정(구매/포기) 로컬 오버레이. DB에는 쓰지 않고 화면 표시에서만 이 worry를 제외시키는 용도. */
export interface OutcomeOverlay {
  outcome: 'abandoned' | 'purchased';
  decidedAt: number; // epoch ms, 시트 안내문구용
}

/** 삭제 로컬 오버레이. 실제 DB delete가 아니라 화면 표시에서만 제외시키는 용도(id만 있으면 되므로 Set으로 관리). */
export type DeletedWorryIds = Set<string>;

/** WorryCard 등이 바로 쓰는 파생 뷰 모델. */
export interface WorryListView {
  worry: WorryRecord; // id/name/price/category/thumbnailUrl/aiVerdict 등 원본
  status: 'ongoing' | 'paused' | 'pending';
  displayRemainingSeconds: number; // paused면 스냅샷 고정값, 아니면 실시간 계산값
  displayProgressPercent: number;
  /**
   * ongoing 상태일 때 카드 내부 useCountdown이 실시간으로 갱신할 목표 시각(epoch ms).
   * "재개" 직후에는 resumedDisplayDeadlines 오버라이드 값, 그 외엔 worry.deadlineAt 그대로.
   * paused/pending은 카운트다운을 갱신하지 않으므로 null.
   */
  countdownTargetMs: number | null;
}
