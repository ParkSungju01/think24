import { House } from 'lucide-react';
import { BottomNavItem } from './BottomNavItem';
import { NewWorryFab } from './NewWorryFab';
import { ROUTES } from '../../routes/paths';
import reportIcon from '../../assets/report.svg';
import listIcon from '../../assets/list.svg';
import myPageIcon from '../../assets/my-page.svg';

export function BottomNav() {
  return (
    // 확인 완료: position fixed + bottom 0으로 항상 화면 하단에 고정. 하단 내비 바 자체의 배경은
    // 피그마 원본대로 흰색(사용자 재확인 완료) — 페이지/상단 바 배경(#eefff0)과는 별개로 유지.
    // 리뷰 재작업: FAB가 absolute로 빠져 있으면 justify-around가 나머지 4개만 기준으로 간격을 계산해
    // "+" 버튼이 균등 간격에서 벗어나 보이는 문제가 있었다. 5개 항목을 동일 폭(flex-1)의 슬롯으로 만들고
    // 각 슬롯 내부에서 아이콘을 가운데 정렬해, 수평 위치/간격은 항상 flex 흐름을 따르도록 바꿨다.
    // 위로 튀어나온 형태(피그마 실측: 내비 바 상단 경계를 23px 덮음)는 NewWorryFab 내부의
    // -translate-y로만 표현해 레이아웃 흐름(간격 계산)에는 영향을 주지 않게 함.
    <nav className="fixed inset-x-0 bottom-0 z-10 flex h-18.75 items-center bg-white lg:hidden">
      <div className="flex flex-1 justify-center">
        <BottomNavItem
          to={ROUTES.home}
          label="홈"
          icon={<House className="h-7.5 w-7.5" />}
          end
        />
      </div>
      <div className="flex flex-1 justify-center">
        <BottomNavItem
          to={ROUTES.records}
          label="소비 기록"
          icon={<img src={reportIcon} alt="" className="h-7.5 w-7.5" />}
        />
      </div>
      <div className="flex flex-1 justify-center">
        <NewWorryFab />
      </div>
      <div className="flex flex-1 justify-center">
        <BottomNavItem
          to={ROUTES.worries}
          label="고민 목록"
          icon={<img src={listIcon} alt="" className="h-7.5 w-7.5" />}
        />
      </div>
      <div className="flex flex-1 justify-center">
        <BottomNavItem
          to={ROUTES.mypage}
          label="마이페이지"
          icon={<img src={myPageIcon} alt="" className="h-7.5 w-7.5" />}
        />
      </div>
    </nav>
  );
}
