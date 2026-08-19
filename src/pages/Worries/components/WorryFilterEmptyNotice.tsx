import type { WorryListFilter } from '../../../types/worriesList';

const FILTER_EMPTY_MESSAGE: Record<Exclude<WorryListFilter, 'all'>, string> = {
  ongoing: '진행 중인 고민이 없어요',
  paused: '일시정지된 고민이 없어요',
  pending: '결정 대기 중인 고민이 없어요',
};

interface WorryFilterEmptyNoticeProps {
  filter: Exclude<WorryListFilter, 'all'>;
}

/**
 * "전체"가 아닌 특정 필터를 선택했는데 0건인 경우, 전체 빈 화면(WorryEmptyState) 대신 리스트
 * 자리에만 들어가는 짧은 문구. `OngoingWorriesCard`의 "등록된 고민이 없어요"와 동일한 스타일.
 * 필터별 카피는 피그마에 정확한 문구가 없어 계획서에서 제안·확정된 표현을 그대로 사용.
 */
export function WorryFilterEmptyNotice({ filter }: WorryFilterEmptyNoticeProps) {
  return (
    <p className="py-6 text-center text-[15px] font-medium text-[#666]">
      {FILTER_EMPTY_MESSAGE[filter]}
    </p>
  );
}
