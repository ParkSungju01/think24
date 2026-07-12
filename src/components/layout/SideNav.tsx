import { House } from 'lucide-react';
import { NavItem } from './NavItem';
import { ROUTES } from '../../routes/paths';
import addWorryIcon from '../../assets/add-worry.svg';
import listIcon from '../../assets/list.svg';
import reportIcon from '../../assets/report.svg';
import myPageIcon from '../../assets/my-page.svg';

export function SideNav() {
  return (
    <nav className="flex flex-col gap-2 px-6">
      <NavItem to={ROUTES.home} label="홈" icon={<House className="h-6 w-6" />} end />
      <NavItem
        to={ROUTES.newWorry}
        label="새 고민 생성"
        icon={<img src={addWorryIcon} alt="" className="h-6 w-6" />}
      />
      <NavItem
        to={ROUTES.worries}
        label="고민 목록"
        icon={<img src={listIcon} alt="" className="h-6 w-6" />}
      />
      <NavItem
        to={ROUTES.records}
        label="소비 기록"
        icon={<img src={reportIcon} alt="" className="h-6 w-6" />}
      />
      <NavItem
        to={ROUTES.mypage}
        label="마이페이지"
        icon={<img src={myPageIcon} alt="" className="h-6 w-6" />}
      />
    </nav>
  );
}
