interface HomeHeaderProps {
  userName: string;
}

// 이슈 #39: 데스크톱 전용(hidden lg:flex)으로 노출되던 벨은 폰 프레임 안에서 렌더링 경로가
// 사라져 제거했다 — 모바일에서는 원래도 MobileTopBar의 벨만 사용해 중복이 없었다.
export function HomeHeader({ userName }: HomeHeaderProps) {
  return (
    <div className="flex items-start justify-between px-4">
      <p className="text-[15px] font-medium text-black">
        ✨ {userName}님,
        <br />
        잠시 멈추면 더 좋은 선택이 보입니다.
      </p>
    </div>
  );
}
