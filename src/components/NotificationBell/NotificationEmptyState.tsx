import bulbIcon from '../../assets/electric_bulb.svg';

export function NotificationEmptyState() {
  return (
    // 확인 완료: 빈 상태 전용 일러스트를 새로 만들지 않고 기존 electric_bulb.svg로 대체한다.
    // 더미 데이터는 5개로 채워 실제로는 보이지 않지만, 0건 분기 로직 자체는 요구사항이라 유지한다.
    <div className="flex flex-col items-center gap-3 px-3 py-10 text-center">
      <img src={bulbIcon} alt="" className="h-15.5 w-13" />
      <p className="text-[15px] font-medium text-black">아직 알림이 없어요</p>
    </div>
  );
}
