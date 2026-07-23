import logo from "../../assets/logo.svg"

export function NotificationEmptyState() {
  return (
    // 확인 완료: 빈 상태 전용 일러스트를 새로 만들지 않고 기존 electric_bulb.svg로 대체한다.
    // 더미 데이터는 5개로 채워 실제로는 보이지 않지만, 0건 분기 로직 자체는 요구사항이라 유지한다.
    <div className="flex flex-1 flex-col items-center justify-center gap-3 px-3 py-10 text-center mb-30">
      <img src={logo} alt="" className="size-18.75" />
      <p className="text-[15px] font-medium text-black">아직 알림이 없어요</p>
    </div>
  );
}
