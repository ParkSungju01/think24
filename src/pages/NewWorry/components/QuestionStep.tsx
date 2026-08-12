import { useMemo, useState } from 'react';
import { ChevronLeft, Circle, CircleCheck, Lightbulb } from 'lucide-react';
import { QUESTION_ANSWER_OPTIONS } from '../../../types/newWorry';
import type { AiQuestion } from '../../../types/newWorry';

const OPTION_COUNT = 3;

/** ai-generate-questions가 이미 3개를 채워 보내지만(normalizeOptions), 배포 전 캐시된
 * 응답이나 예상 밖의 응답을 대비해 프론트에도 동일한 방어 로직을 한 번 더 둔다 — options가
 * 비었거나 부족하면 질문마다 다른 문구 대신 고정 3지선다(QUESTION_ANSWER_OPTIONS)로 대체한다. */
function resolveOptions(question: AiQuestion): string[] {
  const valid = (question.options ?? []).filter(
    (option) => typeof option === 'string' && option.length > 0,
  );
  return valid.length >= OPTION_COUNT
    ? valid.slice(0, OPTION_COUNT)
    : [...QUESTION_ANSWER_OPTIONS];
}

interface QuestionStepProps {
  question: AiQuestion;
  questionIndex: number;
  totalQuestions: number;
  selectedAnswer: string | null;
  onSelectAnswer: (option: string) => void;
  onNext: () => void;
  onPrevious: () => void;
}

/**
 * docs/plans/new-worry.md "질문/답변 스텝 상세" (모바일 `313`/`315`/`316` 클러스터 기준,
 * 반응형으로 웹 적용). 질문마다 "AI가 이 질문을 하는 이유" 토글은 질문이 바뀔 때마다
 * 다시 접힌 상태로 시작하도록 questionIndex를 key로 컴포넌트를 리마운트한다(부모에서 처리).
 */
export function QuestionStep({
  question,
  questionIndex,
  totalQuestions,
  selectedAnswer,
  onSelectAnswer,
  onNext,
  onPrevious,
}: QuestionStepProps) {
  const [isReasonOpen, setIsReasonOpen] = useState(false);
  const options = useMemo(() => resolveOptions(question), [question]);

  return (
    <div className="mx-auto flex w-full max-w-105 flex-col px-6 pt-10 pb-24">
      <p className="text-[14px] font-semibold text-[#4fb75b]">
        AI 질문 ({questionIndex + 1}/{totalQuestions})
      </p>

      <h2 className="mt-3 text-[20px] font-bold leading-6.5 text-black">
        {question.question}
      </h2>

      <button
        type="button"
        onClick={() => setIsReasonOpen((prev) => !prev)}
        className="mt-3 flex items-center gap-1.5 text-[13px] font-medium text-[#899086]"
      >
        <Lightbulb className="h-4 w-4" aria-hidden="true" />
        AI가 이 질문을 하는 이유
      </button>
      {isReasonOpen && (
        <p className="mt-2 rounded-xl bg-[#f6fef7] p-4 text-[13px] leading-5 text-[#666]">
          {question.reason}
        </p>
      )}

      <div className="mt-8 flex flex-col gap-3">
        {options.map((option) => {
          const isSelected = selectedAnswer === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelectAnswer(option)}
              aria-pressed={isSelected}
              className={`flex items-center gap-3 rounded-xl border px-4 py-3.5 text-left text-[15px] font-medium transition-colors ${
                isSelected
                  ? 'border-[#4fb75b] bg-[#e9f6e4] text-[#3e9b48]'
                  : 'border-[#dedede] bg-white text-black'
              }`}
            >
              {isSelected ? (
                <CircleCheck
                  className="h-5 w-5 shrink-0 text-[#4fb75b]"
                  aria-hidden="true"
                />
              ) : (
                <Circle
                  className="h-5 w-5 shrink-0 text-[#a9a9a9]"
                  aria-hidden="true"
                />
              )}
              {option}
            </button>
          );
        })}
      </div>

      <div className="mt-10 flex items-center gap-3">
        <button
          type="button"
          onClick={onPrevious}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[9px] border border-[#a9a9a9] text-[#666]"
          aria-label="이전"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onNext}
          disabled={!selectedAnswer}
          className={`h-11 flex-1 rounded-[9px] text-[15px] font-medium transition-colors ${
            selectedAnswer
              ? 'bg-[#3e9b48] text-white'
              : 'cursor-not-allowed bg-[#e7eae4] text-[#a9a9a9]'
          }`}
        >
          다음
        </button>
      </div>
    </div>
  );
}
