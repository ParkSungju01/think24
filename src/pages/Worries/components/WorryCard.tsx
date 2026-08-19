import { X } from 'lucide-react';
import { useCountdown } from '../../../hooks/useCountdown';
import { formatRemainingTime, formatWon } from '../../../utils/format';
import type { WorryListView } from '../../../types/worriesList';
import { WorryThumbnail } from '../../../components/WorryThumbnail';

interface WorryCardProps {
  view: WorryListView;
  onPause: (id: string) => void;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onDecide: (id: string) => void;
}

const AI_VERDICT_BADGE = {
  necessary: {
    label: 'AI · 합리적',
    className: 'bg-[#e9f6e4] text-[#3e9b48]',
  },
  unnecessary: {
    label: 'AI · 충동 신호',
    className: 'bg-[#fbe4e1] text-[#e05b4e]',
  },
} as const;

/**
 * docs/plans/worries-list.md 실측 스펙 — 카드(ConcernCard): 342×180 → w-full, rounded-[14px],
 * border, bg-white, p-4, 카드 간 gap-3(부모 리스트에서 처리). ongoing/paused/pending 3 variant.
 */
export function WorryCard({
  view,
  onPause,
  onResume,
  onDelete,
  onDecide,
}: WorryCardProps) {
  const { worry, status } = view;

  // ongoing만 실시간 카운트다운(매초 갱신). paused/pending은 파생값(스냅샷/고정값)을 그대로 쓴다
  // (계획서: "이 함수(deriveWorryListViews)는 초기 정렬/카운트용 스냅샷만 계산" — 실제 표시는
  // 카드 내부 useCountdown 책임).
  const liveRemainingSeconds = useCountdown(view.countdownTargetMs);
  const remainingSeconds =
    status === 'ongoing' ? liveRemainingSeconds : view.displayRemainingSeconds;
  const totalMs = worry.deadlineAt.getTime() - worry.createdAt.getTime();
  const progressPercent =
    status === 'ongoing' && totalMs > 0
      ? Math.min(
          100,
          Math.max(0, ((totalMs - remainingSeconds * 1000) / totalMs) * 100),
        )
      : view.displayProgressPercent;

  const isPending = status === 'pending';
  const aiBadge = worry.aiVerdict
    ? AI_VERDICT_BADGE[worry.aiVerdict.verdict]
    : null;

  const cardBorderClassName = isPending
    ? 'border-[#e05b4e]/40'
    : 'border-[#eee]';

  const countdownColorClassName = isPending
    ? 'text-[#e05b4e]'
    : status === 'paused'
      ? 'text-[#999]'
      : 'text-black';

  const statusLabelClassName = isPending
    ? 'text-[#e05b4e]'
    : status === 'paused'
      ? 'text-[#999]'
      : 'text-[#3e9b48]';

  const statusLabel = isPending
    ? '타이머 종료'
    : status === 'paused'
      ? '일시정지됨'
      : '남음';

  const progressFillClassName = isPending
    ? 'bg-[#e05b4e]'
    : status === 'paused'
      ? 'bg-[#ccc]'
      : 'bg-[#3e9b48]';

  return (
    <div
      className={`w-full rounded-[14px] border bg-white p-4 ${cardBorderClassName}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <WorryThumbnail
          src={worry.thumbnailUrl}
          alt={worry.name}
          sizeClassName="h-13 w-13 rounded-[10px]"
        />
        <span className="h-5 rounded-full bg-[#eef2ea] px-2 text-[13px] text-[#4d5d47]">
          {worry.category}
        </span>
        {aiBadge && (
          <span
            className={`h-5 rounded-full px-2 text-[13px] font-medium ${aiBadge.className}`}
          >
            {aiBadge.label}
          </span>
        )}
        {status === 'paused' && (
          <span className="ml-auto h-5 rounded-full bg-[#f0f0f0] px-2 text-[13px] text-[#666]">
            일시정지
          </span>
        )}
      </div>

      <p className="mt-3 truncate text-[15px] font-semibold text-black">
        {worry.name}
      </p>
      <p className="mt-1 text-[13px] text-[#666]">{formatWon(worry.price)}원</p>

      <div className="mt-3 flex items-baseline justify-between">
        <span
          className={`text-[20px] font-bold tabular-nums ${countdownColorClassName}`}
        >
          {formatRemainingTime(remainingSeconds)}
        </span>
        <span className={`text-[12px] ${statusLabelClassName}`}>
          {statusLabel}
        </span>
      </div>

      <div className="mt-2 h-1.5 rounded-full bg-[#eee]">
        <div
          className={`h-1.5 rounded-full ${progressFillClassName}`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="mt-3 flex h-10.5 gap-2">
        {status === 'ongoing' && (
          <>
            <button
              type="button"
              onClick={() => onPause(worry.id)}
              className="flex-1 cursor-pointer rounded-[10px] border border-[#dedede] bg-white text-black"
            >
              일시정지
            </button>
            <button
              type="button"
              onClick={() => onDelete(worry.id)}
              aria-label="삭제"
              className="w-12 cursor-pointer rounded-[10px] border border-[#dedede] bg-white text-black"
            >
              <X className="mx-auto h-4 w-4" />
            </button>
          </>
        )}
        {status === 'paused' && (
          <>
            <button
              type="button"
              onClick={() => onResume(worry.id)}
              className="flex-1 cursor-pointer rounded-[10px] border border-[#dedede] bg-white text-black"
            >
              타이머 재개
            </button>
            <button
              type="button"
              onClick={() => onDelete(worry.id)}
              aria-label="삭제"
              className="w-12 cursor-pointer rounded-[10px] border border-[#dedede] bg-white text-black"
            >
              <X className="mx-auto h-4 w-4" />
            </button>
          </>
        )}
        {status === 'pending' && (
          <button
            type="button"
            onClick={() => onDecide(worry.id)}
            className="flex-1 cursor-pointer rounded-[10px] bg-[#3e9b48] font-semibold text-white"
          >
            최종 결정하기
          </button>
        )}
      </div>
    </div>
  );
}
