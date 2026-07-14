import { House } from 'lucide-react';
import { BottomNavItem } from './BottomNavItem';
import { NewWorryFab } from './NewWorryFab';
import { ROUTES } from '../../routes/paths';
import reportIcon from '../../assets/report.svg';
import listIcon from '../../assets/list.svg';
import myPageIcon from '../../assets/my-page.svg';

export function BottomNav() {
  return (
    // 확인 완료: position fixed + bottom 0으로 항상 화면 하단에 고정, 카드와 동일한 톤의 상단 보더
    <nav className="fixed inset-x-0 bottom-0 z-10 flex h-18.75 items-center justify-around border-t border-[rgba(188,230,193,0.55)] bg-white lg:hidden">
      <BottomNavItem
        to={ROUTES.home}
        label="홈"
        icon={<House className="h-7.5 w-7.5" />}
        end
      />
      <BottomNavItem
        to={ROUTES.records}
        label="소비 기록"
        icon={<img src={reportIcon} alt="" className="h-7.5 w-7.5" />}
      />
      <BottomNavItem
        to={ROUTES.worries}
        label="고민 목록"
        icon={<img src={listIcon} alt="" className="h-7.5 w-7.5" />}
      />
      <BottomNavItem
        to={ROUTES.mypage}
        label="마이페이지"
        icon={<img src={myPageIcon} alt="" className="h-7.5 w-7.5" />}
      />
      <NewWorryFab />
    </nav>
  );
}
