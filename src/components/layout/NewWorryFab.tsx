import { Link } from 'react-router-dom';
import fabPlus from '../../assets/fab-plus.svg';
import { ROUTES } from '../../routes/paths';

export function NewWorryFab() {
  return (
    // 확인 완료: 사용자 제공 에셋(fab-plus.svg)을 배경색/아이콘 조합 없이 그대로 사용
    // 리뷰 재작업: absolute 대신 부모(BottomNav)의 flex 슬롯 안에 정상적으로 배치하고,
    // -translate-y로만 위로 띄워 내비 바 상단 경계를 23px 덮는 형태(피그마 실측)를 유지한다.
    // 수평 위치는 부모 슬롯의 justify-center에 맡기므로 좌우 정렬용 클래스는 더 이상 필요 없음.
    <Link
      to={ROUTES.newWorry}
      aria-label="새 고민 생성"
      className="-translate-y-5.75 rounded-full bg-white"
    >
      <div className='bg-[#A2F1AB] rounded-full'>
        <img src={fabPlus} alt="" className="bg-[A2F1AB] h-16 w-16" />
      </div>
    </Link>
  );
}
