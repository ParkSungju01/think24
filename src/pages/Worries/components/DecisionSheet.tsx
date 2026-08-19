import type { WorryRecord } from '../../../lib/worries';
import { formatWon } from '../../../utils/format';

interface DecisionSheetProps {
  worry: WorryRecord;
  onAbandon: () => void;
  onPurchase: () => void;
  onDismiss: () => void;
}

/**
 * docs/plans/worries-list.md 화면 2 — 결정 대기 카드 "최종 결정하기"에서 뜨는 바텀시트.
 * 그랩 핸들/딤 배경 클릭 시 아무 오버레이도 기록하지 않고 닫히기만 한다(확정된 정책: 결정
 * 없이 닫으면 카드는 여전히 결정 대기로 유지).
 *
 * 하단 안내 문구는 원본 피그마 카피("선택은 소비 기록에 바로 반영됩니다")가 실제 동작(로컬
 * 상태만 반영, 소비 기록/DB 미반영)과 맞지 않아 "선택 결과가 이 목록에 반영됩니다"로 교체함
 * (계획서에서 확정된 문구 수정).
 */
export function DecisionSheet({
  worry,
  onAbandon,
  onPurchase,
  onDismiss,
}: DecisionSheetProps) {
  const scores = worry.aiVerdict?.scores;

  return (
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end bg-black/40"
      role="dialog"
      aria-modal="true"
      onClick={onDismiss}
    >
      <div
        className="rounded-t-[20px] bg-white px-6 pt-3 pb-8"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="닫기"
          className="mx-auto block h-1 w-12 rounded-full bg-[#dedede]"
        />

        <h2 className="mt-5 text-[20px] font-bold text-black">
          24시간이 지났어요
        </h2>
        <p className="mt-1 text-[13px] text-[#666]">
          {worry.name} · {formatWon(worry.price)}원
        </p>

        {scores && (
          <div className="mt-4 rounded-[14px] bg-[#e9f6e4] p-4">
            <p className="text-[12px] text-[#666]">AI 진단 요약</p>
            <p className="mt-1 text-[16px] font-bold text-black">
              필요성 {scores.necessity.percent}% · 충동성{' '}
              {scores.impulsiveness.percent}%
            </p>
            {worry.aiVerdict?.description && (
              <p className="mt-2 text-[12px] text-[#666]">
                {worry.aiVerdict.description}
              </p>
            )}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onAbandon}
            className="h-13 rounded-[10px] bg-[#3e9b48] font-semibold text-white"
          >
            포기하기 · {formatWon(worry.price)}원 절약
          </button>
          <button
            type="button"
            onClick={onPurchase}
            className="h-13 rounded-[10px] border border-[#dedede] bg-white font-semibold text-black"
          >
            구매하기
          </button>
        </div>

        <p className="mt-4 text-center text-[12px] text-[#666]">
          선택 결과가 이 목록에 반영됩니다
        </p>
      </div>
    </div>
  );
}
