import type { LucideIcon } from 'lucide-react';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

/** docs/plans/landing-phone-refactor.md 3-5 5번. PitchPanel의 피처 카드 1개 단위. */
export function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col gap-2 rounded-2xl border border-[rgba(188,230,193,0.55)] bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#e9f6e4]">
        <Icon className="h-5 w-5 text-[#3e9b48]" aria-hidden="true" />
      </div>
      <h3 className="text-[16px] font-semibold text-[#1f2420]">{title}</h3>
      <p className="text-[13px] leading-5 text-[#899086]">{description}</p>
    </div>
  );
}
