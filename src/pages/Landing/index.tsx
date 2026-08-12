import { Outlet } from 'react-router-dom';
import { PhoneFrame } from '../../components/layout/PhoneFrame';
import { PitchPanel } from './components/PitchPanel';

/**
 * docs/plans/landing-phone-refactor.md 3-1/3-3. 최상위 레이아웃 라우트(path 없음, URL 세그먼트를
 * 소비하지 않는다) — 좌측 서비스 설명 패널 + 우측 폰 프레임(그 안에서 <Outlet/>으로 실제 앱 라우트가
 * react-router로 동작) 구조를 모든 라우트에 씌운다.
 *
 * 사용자 확인 완료 결정 1번(Option A): 패널은 `/login`, `/worries/new` 등 라우트와 무관하게
 * 항상 유지한다. 결정 2번: 좁은 화면(< xl)에서는 패널을 숨기고 폰 프레임(앱 본문)만 전체 화면으로
 * 노출한다 — 좁은 화면 방문자에게는 데모 소개보다 앱 자체가 더 자연스럽기 때문.
 */
export function LandingLayout() {
  return (
    // overflow-hidden: 이 컨테이너 자체(=문서/뷰포트)는 스크롤되지 않는다. PitchPanel 콘텐츠가
    // 뷰포트보다 길어지면(좁은 세로 높이 등) PitchPanel 자신이 내부에서 스크롤되고(self-stretch +
    // overflow-y-auto, PitchPanel.tsx 참고), PhoneFrame은 항상 같은 자리에 고정돼 보인다.
    <div className="flex h-full w-full items-stretch justify-center overflow-hidden bg-[#f4faef] xl:items-center xl:gap-16 xl:p-10">
      <PitchPanel className="hidden xl:flex" />
      <PhoneFrame>
        <Outlet />
      </PhoneFrame>
    </div>
  );
}

export default LandingLayout;
