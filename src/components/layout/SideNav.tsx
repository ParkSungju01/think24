import { House } from 'lucide-react';
import { NavItem } from './NavItem';
import { ROUTES } from '../../routes/paths';
import addWorryIcon from '../../assets/add-worry.svg';
import listIcon from '../../assets/list.svg';
import reportIcon from '../../assets/report.svg';
import myPageIcon from '../../assets/my-page.svg';

export function SideNav() {
  return (
    <nav className="flex flex-col gap-4.5 px-5.5">
      <NavItem to={ROUTES.home} label="홈" icon={<House className="h-5.75 w-5.75" />} end />
      <NavItem
        to={ROUTES.newWorry}
        label="새 고민 생성"
        icon={<img src={addWorryIcon} alt="" className="h-5.75 w-5.75" />}
        end
      />
      {/* 버그 수정: /worries가 /worries/new의 접두 경로라서 end 없이는 "새 고민 생성"
          페이지에 있을 때도 NavLink가 이 항목을 함께 active로 매칭했다(react-router-dom
          기본 동작). 나머지 항목(소비 기록/프로필)은 서로 접두사 관계가 아니라 원래도
          문제없었지만, 향후 하위 경로가 생겨도 안전하도록 전부 end를 붙여 일관되게 맞췄다. */}
      <NavItem
        to={ROUTES.worries}
        label="고민 목록"
        icon={<img src={listIcon} alt="" className="h-5.75 w-5.75" />}
        end
      />
      <NavItem
        to={ROUTES.records}
        label="소비 기록"
        icon={<img src={reportIcon} alt="" className="h-5.75 w-5.75" />}
        end
      />
      <NavItem
        to={ROUTES.mypage}
        label="프로필"
        icon={<img src={myPageIcon} alt="" className="h-5.75 w-5.75" />}
        end
      />
    </nav>
  );
}
