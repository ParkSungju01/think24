import {
  Clock,
  MessageCircleQuestion,
  MousePointerClick,
  PiggyBank,
  Sparkles,
} from 'lucide-react';
import logo from '../../../assets/logo.svg';
import { FeatureCard } from './FeatureCard';

// 카피는 전부 placeholder (docs/plans/landing-phone-refactor.md 3-5, 사용자 확인 완료 결정 5번:
// 사용자가 나중에 직접 교체할 예정이라 초안 수준으로 채움). 레이아웃 구조(배지→헤드라인→서브카피→
// 통계 3개→피처 카드 3개→안내 박스)만 레퍼런스 사이트를 참고했고, 색/카피/서비스명("멈칫")은
// 기존 브랜드 그대로 사용.
const STATS = [
  { label: '24시간', description: '충동구매를 늦추는 숙려 시간' },
  { label: 'AI 질문', description: '소비 패턴을 스스로 점검' },
  { label: '절약 기록', description: '아낀 금액을 한눈에 확인' },
];

const FEATURES = [
  {
    icon: MessageCircleQuestion,
    title: 'AI 질문으로 충동구매 점검',
    description:
      '몇 가지 질문에 답하면 AI가 지금 이 소비가 정말 필요한지 판단해드려요.',
  },
  {
    icon: Clock,
    title: '24시간 타이머로 숙려 기간 확보',
    description:
      '결제 대신 타이머를 걸어두고, 하루 동안 다시 생각할 시간을 가져보세요.',
  },
  {
    icon: PiggyBank,
    title: '절약 기록·리포트로 소비 습관 관리',
    description:
      '포기한 소비와 절약한 금액을 기록해 나의 소비 습관을 돌아볼 수 있어요.',
  },
];

interface PitchPanelProps {
  className?: string;
}

/**
 * docs/plans/landing-phone-refactor.md 3-5. 좌측 서비스 설명 패널.
 * 사용자 확인 완료 결정 1번(Option A)에 따라 모든 라우트에서 항상 렌더링되지만,
 * 좁은 화면(결정 2번)에서는 LandingLayout이 이 컴포넌트에 hidden 계열 className을
 * 넘겨 숨긴다(컴포넌트 자체는 표시 여부를 모르고, 부모가 className으로 제어).
 */
export function PitchPanel({ className = '' }: PitchPanelProps) {
  return (
    // xl:self-stretch + xl:overflow-y-auto: 부모(LandingLayout)가 PhoneFrame을 세로 중앙에 두려고
    // items-center를 쓰는데, 그 상태 그대로면 이 패널도 콘텐츠 높이만큼만 차지해 화면보다 길어질 때
    // 페이지 전체가 스크롤되며 PhoneFrame까지 함께 밀려버린다. self-stretch로 이 패널만 부모 높이를
    // 꽉 채우게 하고, 넘치는 콘텐츠는 이 패널 내부에서만 스크롤되게 해 PhoneFrame은 항상 제자리에 고정한다.
    // 사용자 요청: PhoneFrame(844px) 기준 xl 가용 높이 안에 스크롤 없이 전부 보이도록 섹션 간
    // 여백을 압축했다. gap-5가 flex 컨테이너 차원에서 섹션 사이 간격을 이미 담당하므로(이전엔
    // 각 섹션에 중복으로 mt-8도 붙어 있어 섹션 사이가 실제로는 gap+margin이 두 번 겹쳐 64px씩
    // 벌어져 있었다 — 그 중복 마진을 걷어낸 게 가장 큰 절감분), 개별 섹션에는 더 이상 mt- 클래스를
    // 쓰지 않는다. xl:overflow-y-auto는 폰트 크기 등 외부 요인으로 다시 넘칠 때를 대비한 안전망으로 남겨둔다.
    <div
      className={`w-full max-w-125 flex-col gap-4 py-4 xl:self-stretch xl:overflow-y-auto ${className}`}
    >
      <div className="flex items-center gap-2">
        <img src={logo} alt="" className="h-8 w-8" />
        <span className="flex items-center gap-1 rounded-full bg-[#e9f6e4] px-3 py-1 text-[13px] font-medium text-[#3e9b48]">
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          멈칫 프로토타입
        </span>
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-[36px] leading-tight font-bold text-[#1f2420]">
          충동구매 앞에서,
          <br />
          잠깐 멈춰보세요.
        </h1>
        <p className="text-[15px] leading-6.5 text-[#899086]">
          AI가 몇 가지 질문으로 지금 이 소비가 필요한지 점검하고, 24시간
          타이머로 충동을 가라앉힐 시간을 드려요.
        </p>
      </div>

      <div className="flex gap-4">
        {STATS.map((stat) => (
          <div
            key={stat.label}
            className="flex flex-1 flex-col gap-1 rounded-2xl bg-white p-3"
          >
            <span className="text-[18px] font-bold text-[#3e9b48]">
              {stat.label}
            </span>
            <span className="text-[12px] leading-4.5 text-[#899086]">
              {stat.description}
            </span>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {FEATURES.map((feature) => (
          <FeatureCard key={feature.title} {...feature} />
        ))}
      </div>

      <div className="flex items-center gap-3 rounded-2xl bg-[#e9f6e4] p-3 text-[13px] font-medium text-[#3e9b48]">
        <MousePointerClick className="h-5 w-5 shrink-0" aria-hidden="true" />
        오른쪽 화면을 직접 눌러보세요. 로그인부터 새 고민 등록까지 실제로
        동작하는 프로토타입입니다.
      </div>
    </div>
  );
}
