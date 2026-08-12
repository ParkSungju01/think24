import { BrandLogo } from './BrandLogo';
import { NotificationBell } from '../NotificationBell';

export function MobileTopBar() {
  return (
    // 피그마 실측(y 0~93, 로고 x=23 / 벨 우측 여백 18.5px): 기존 BrandLogo/NotificationBell을
    // 그대로 재사용하고 상하 여백(py-5)으로 93px 높이에 근접하도록 배치
    <header className="flex items-center justify-between bg-[#eefff0] pt-5 pl-5.75 pr-5.75">
      <BrandLogo />
      {/* 이슈 #17 확인 완료: 벨을 누르면 드롭다운이 아니라 /notifications 풀스크린 페이지로 이동 */}
      <NotificationBell />
    </header>
  );
}
