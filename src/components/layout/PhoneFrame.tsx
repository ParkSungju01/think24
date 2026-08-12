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
 * 안쪽 스크린 div(relative + overflow-y-auto)가 AppLayout/BottomNav/Toast/ConfirmModal이
 * absolute로 기준 삼는 포지셔닝 컨텍스트다 — 스크롤 컨테이너 자체의 padding box를 기준으로
 * absolute 자식이 배치되므로, 콘텐츠가 스크롤돼도 하단 고정 내비/토스트/모달은 화면 밖으로
 * 새지 않고 프레임 안에서 계속 같은 자리에 떠 있는다.
 */
export function PhoneFrame({ children }: PhoneFrameProps) {
  return (
    <div className="h-full w-full overflow-hidden bg-white xl:h-211 xl:w-97.5 xl:shrink-0 xl:rounded-[52px] xl:border-14 xl:border-black xl:bg-black xl:shadow-2xl">
      <div className="relative h-full w-full overflow-x-hidden overflow-y-auto bg-white xl:rounded-[40px]">
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
