import { Link } from 'react-router-dom';
import fabPlus from '../../assets/fab-plus.svg';
import { ROUTES } from '../../routes/paths';

export function NewWorryFab() {
  return (
    // 확인 완료: 사용자 제공 에셋(fab-plus.svg)을 배경색/아이콘 조합 없이 그대로 사용,
    // 내비 바 상단 경계를 23px 덮으며 떠 있는 형태로 배치
    <Link
      to={ROUTES.newWorry}
      aria-label="새 고민 생성"
      className="absolute left-1/2 -top-5.75 -translate-x-1/2"
    >
      <img src={fabPlus} alt="" className="h-16 w-16" />
    </Link>
  );
}
