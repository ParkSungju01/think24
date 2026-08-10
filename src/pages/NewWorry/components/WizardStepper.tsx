import type { NewWorryStep } from '../useNewWorryFlow';

const STEP_LABELS = ['상품 정보', '질문', '완료'] as const;

/** step을 3단계 위저드 인덱스(0~2)로 매핑. 질문 생성/응답/판정 로딩/판정 결과는 모두
 * "질문" 단계로 묶인다(피그마 3단계 헤더가 "상품 정보/질문/완료"이므로). */
function stepToWizardIndex(step: NewWorryStep): number {
  if (step === 'productInfo') return 0;
  if (step === 'timerStarted') return 2;
  return 1;
}

/**
 * docs/plans/new-worry.md 상품 정보 입력 필드 상세 마커 1번: "지금 어떤 단계인지 확인 할 수
 * 있는 이미지입니다. 해당 단계가 되면 초록색으로 변합니다." 나머지 스텝은 웹 실측 없이 모바일
 * 헤더 프레임(390×88)만 있어 동일한 스타일을 모든 스텝 상단에 재사용한다.
 */
export function WizardStepper({ step }: { step: NewWorryStep }) {
  const activeIndex = stepToWizardIndex(step);

  return (
    <div
      className="flex items-center justify-center gap-2"
      aria-label="새 고민 생성 진행 단계"
    >
      {STEP_LABELS.map((label, index) => (
        <div key={label} className="flex items-center gap-2">
          <span
            className={`rounded-full px-4 py-1.5 text-[13px] font-semibold transition-colors lg:text-[15px] ${
              index === activeIndex
                ? 'bg-[#e9f6e4] text-[#3e9b48]'
                : 'bg-[#f3f3f3] text-[#a9a9a9]'
            }`}
          >
            {label}
          </span>
          {index < STEP_LABELS.length - 1 && (
            <span className="h-px w-6 bg-[#dedede] lg:w-10" />
          )}
        </div>
      ))}
    </div>
  );
}
