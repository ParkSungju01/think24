import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/**
 * docs/plans/landing-phone-refactor.md 3-5 5번. PitchPanel의 피처 카드 1개 단위.
 * 사용자 요청: xl 가용 높이(844px 프레임 기준) 안에 PitchPanel 전체가 스크롤 없이 들어오도록
 * 카드 패딩/아이콘 크기/내부 간격을 압축했다(폰트 크기는 그대로 유지).
 */
export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-1.5 rounded-2xl border border-[rgba(188,230,193,0.55)] bg-white p-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#e9f6e4]">
        <Icon className="h-4.5 w-4.5 text-[#3e9b48]" aria-hidden="true" />
      </div>
      <h3 className="text-[16px] font-semibold text-[#1f2420]">{title}</h3>
      <p className="text-[13px] leading-5 text-[#899086]">{description}</p>
    </div>
  );
}
