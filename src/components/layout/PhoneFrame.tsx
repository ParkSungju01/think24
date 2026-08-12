import type { ReactNode } from 'react';
import { BatteryFull, SignalHigh, Wifi } from 'lucide-react';

interface PhoneFrameProps {
  children: ReactNode;
}

/**
 * docs/plans/landing-phone-refactor.md 3-4. 이미지 에셋 없이 순수 CSS(border+rounded+shadow)로
 * 만든 스마트폰 프레임. 실제 앱(children=<Outlet/>)이 그 안에서 react-router로 동작한다.
 *
 * 좁은 화면(< xl, 사용자 확인 완료 결정 2번)에서는 베젤 장식(테두리/모서리/그림자/상태바)을
 * 없애고 화면 콘텐츠만 전체 화면으로 채운다 — 실제 모바일 브라우저에서 가짜 프레임 안에 또
 * 가짜 상태바를 그리면 기기 자체의 상태바와 중복돼 부자연스럽기 때문. xl(1024px)부터는
 * PitchPanel과 함께 보이는 데스크톱 데모용 고정 크기(390×844, 사용자 확인 완료 결정 5번)
 * 프레임으로 전환된다.
 *
 * 바깥 베젤 div가 relative(포지셔닝 컨텍스트)이고, 안쪽 스크린 div는 overflow-y-auto만 가진다
 * (relative가 아님). AppLayout/BottomNav/Toast/ConfirmModal은 absolute로 이 바깥 div를 기준
 * 삼는다 — 처음엔 스크린 div 자체를 relative+overflow-y-auto로 같이 줬었는데, absolute 자식의
 * containing block이 "스크롤되는 그 요소 자신"이면 그 자식도 스크롤 콘텐츠의 일부로 취급돼
 * 함께 밀려 올라가는 게 실제 브라우저 동작이었다(Playwright로 스크롤 전/후 BottomNav의
 * getBoundingClientRect()를 비교해 실제로 함께 움직이는 걸 확인 — 리뷰 재작업). relative를
 * "스크롤되지 않는" 바깥 베젤 div로 옮기면, absolute 자식은 (DOM상 스크린 div 안에 중첩돼
 * 있어도) containing block 탐색이 relative가 없는 스크린 div를 건너뛰어 바깥 베젤 div에
 * 고정되므로, 스크린 div가 아무리 스크롤돼도 화면 안 같은 자리에 계속 떠 있는다.
 */
export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="relative h-full w-full overflow-hidden bg-white xl:h-211 xl:w-97.5 xl:shrink-0 xl:rounded-[52px] xl:border-14 xl:border-black xl:bg-black xl:shadow-2xl">
      <div className="h-full w-full overflow-x-hidden overflow-y-auto bg-white xl:rounded-[40px]">
        {/* 프레임 장식용 가짜 상태바(사용자 확인 완료 결정 3번) — 실제 앱 콘텐츠가 아니라
            데스크톱 데모 프레임 장식이라 xl에서만 노출, 스크롤에 영향받지 않도록 sticky */}
        <div className="sticky top-0 z-30 hidden items-center justify-between bg-white px-8 pt-3 pb-1 text-[15px] font-semibold text-black xl:flex">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <SignalHigh className="h-4 w-4" aria-hidden="true" />
            <Wifi className="h-4 w-4" aria-hidden="true" />
            <BatteryFull className="h-4 w-4" aria-hidden="true" />
          </div>
        </div>
        {children}
      </div>
    </div>
  );
}
