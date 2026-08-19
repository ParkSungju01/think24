/**
 * "AI 소비 분석"(358:819~822). ADR `docs/adr/0002-spending-record-ai-analysis-is-mocked.md`에 따라
 * 실제 LLM 호출 없이 피그마 예시 문구를 완전히 고정 하드코딩한다(기간/카테고리에 따라 바뀌지 않음).
 */
export function AiAnalysisCard() {
  return (
    <div className="flex w-full flex-col gap-2 rounded-[5px] bg-[#e9f6e4] p-4">
      <h2 className="text-[13px] font-semibold text-[#629f41]">
        AI 소비 분석
      </h2>
      <p className="text-[10px] leading-normal font-normal text-[#666]">
        이번 달에 <span className="font-medium text-[#629f41]">패션</span>{' '}
        관련 고민이{' '}
        <span className="font-medium text-[#629f41]">3건</span>으로 제일
        높아요. 비슷한 제품을 여러 번 고민한 기록이 있어요. 정말 필요한지 한
        번 더 생각해보세요!
      </p>
    </div>
  );
}
