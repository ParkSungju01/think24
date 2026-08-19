import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Toast } from '../../components/Toast';
import { ROUTES } from '../../routes/paths';
import { AiLoadingScreen } from './components/AiLoadingScreen';
import { ProductInfoStep } from './components/ProductInfoStep';
import { QuestionStep } from './components/QuestionStep';
import { TimerStartedStep } from './components/TimerStartedStep';
import { VerdictResultStep } from './components/VerdictResultStep';
import { WizardStepper } from './components/WizardStepper';
import { useNewWorryFlow } from './useNewWorryFlow';

/**
 * docs/plans/new-worry.md "화면 구성": 스텝 1~6이 전부 이 라우트(`/worries/new`) 안에서
 * 컴포넌트 상태로 전환되는 단일 위저드. 로컬 쓰기(썸네일 리사이즈 + localStorage insert)는
 * 스텝 5 "24시간 고민 시작하기"를 눌렀을 때 useNewWorryFlow 내부에서 단 한 번만 발생한다.
 */
export function NewWorryPage() {
  const navigate = useNavigate();
  const flow = useNewWorryFlow();

  // 새 에러가 들어올 때만 토스트를 다시 띄운다("렌더링 중 상태 조정" 패턴 — 이전 값과
  // 비교해 바뀐 시점에만 setState. useEffect 안에서 setState하면 리액트 컴파일러/lint가
  // 불필요한 리렌더 캐스케이드로 경고하므로 렌더 중 직접 처리한다).
  const [lastSeenAiError, setLastSeenAiError] = useState<string | null>(null);
  const [isAiErrorToastVisible, setIsAiErrorToastVisible] = useState(false);
  if (flow.aiError !== lastSeenAiError) {
    setLastSeenAiError(flow.aiError);
    if (flow.aiError) setIsAiErrorToastVisible(true);
  }

  const [lastSeenSubmitError, setLastSeenSubmitError] = useState<
    string | null
  >(null);
  const [isSubmitErrorToastVisible, setIsSubmitErrorToastVisible] =
    useState(false);
  if (flow.submitError !== lastSeenSubmitError) {
    setLastSeenSubmitError(flow.submitError);
    if (flow.submitError) setIsSubmitErrorToastVisible(true);
  }

  const handleGoHome = () => {
    // 확인 완료: "홈으로 돌아가기"는 아무 것도 저장하지 않는다. 위저드 로컬 상태는
    // 이 페이지가 언마운트되면서 자연히 폐기된다.
    navigate(ROUTES.home);
  };

  return (
    <div className="flex flex-col">
      <div className="pt-6">
        <WizardStepper step={flow.step} />
      </div>

      {flow.step === 'productInfo' && (
        <ProductInfoStep
          productInfo={flow.productInfo}
          onChange={flow.updateProductInfo}
          onSubmit={flow.submitProductInfo}
        />
      )}

      {flow.step === 'questionLoading' && (
        <AiLoadingScreen
          title="AI가 관련 질문을 생성 중입니다."
          error={flow.aiError}
          onRetry={flow.retryGenerateQuestions}
        />
      )}

      {flow.step === 'questions' && flow.questions && (
        <QuestionStep
          key={flow.currentQuestionIndex}
          question={flow.questions[flow.currentQuestionIndex]}
          questionIndex={flow.currentQuestionIndex}
          totalQuestions={flow.questions.length}
          selectedAnswer={flow.answers[flow.currentQuestionIndex]}
          onSelectAnswer={flow.selectAnswer}
          onNext={flow.goToNextQuestion}
          onPrevious={flow.goToPreviousQuestion}
        />
      )}

      {flow.step === 'verdictLoading' && (
        <AiLoadingScreen
          title="AI가 분석 중이에요."
          description="모든 답변을 종합하여 당신의 소비 패턴을 분석하고 있어요."
          error={flow.aiError}
          onRetry={flow.retryGenerateVerdict}
        />
      )}

      {flow.step === 'verdict' && flow.verdict && (
        <VerdictResultStep
          verdict={flow.verdict}
          isSubmitting={flow.isSubmitting}
          onStartTimer={flow.startTimer}
          onGoHome={handleGoHome}
        />
      )}

      {flow.step === 'timerStarted' && (
        <TimerStartedStep
          onGoToWorries={() => navigate(ROUTES.worries)}
        />
      )}

      {isAiErrorToastVisible && flow.aiError && (
        <Toast
          message={flow.aiError}
          tone="error"
          onDismiss={() => setIsAiErrorToastVisible(false)}
        />
      )}

      {isSubmitErrorToastVisible && flow.submitError && (
        <Toast
          message={flow.submitError}
          tone="error"
          onDismiss={() => {
            setIsSubmitErrorToastVisible(false);
            flow.dismissSubmitError();
          }}
        />
      )}
    </div>
  );
}

export default NewWorryPage;
