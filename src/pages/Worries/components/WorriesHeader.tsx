/**
 * docs/plans/worries-list.md 실측 스펙: 제목은 `RecordsHeader`/`MyPage`와 동일한
 * `text-[25px] font-semibold text-black` 컨벤션.
 */
export function WorriesHeader() {
  return (
    <div className="px-1">
      <h1 className="text-[25px] font-semibold text-black">고민 목록</h1>
    </div>
  );
}
