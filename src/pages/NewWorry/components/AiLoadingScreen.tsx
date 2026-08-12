import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import cloudIcon from '../../../assets/cloud.svg';

interface AiLoadingScreenProps {
  title: string;
  description?: string;
  error: string | null;
  onRetry: () => void;
}

/**
 * docs/plans/new-worry.md "AI 로딩 스텝 상세": 질문 생성 로딩(`313:491`)과 판정 분석
 * 로딩(`316:738`)이 동일한 구성(cloud.svg + 문구)이라 공용 컴포넌트로 묶었다.
 * 확인 완료 3번: 실패 시 이 화면에 그대로 머무르며 에러 토스트(부모의 `Toast`, 자동으로 사라짐)
 * + 이 화면에 계속 남아있는 재시도 버튼을 함께 보여준다.
 *
 * 로딩 표현은 피그마에 명시돼 있지 않은 개발자 재량 영역(같은 문서 참고)이라
 * 실제 진행률을 알 수 없는 AI 응답을 기다리는 동안 "가짜 진행률" 바로 보여준다.
 * 매 tick마다 남은 거리(95 - progress)의 일정 비율만큼만 채워 넣어 시간이
 * 지날수록 점점 느려지며 95%에 근접하도록 하고, 95%는 넘기지 않는다
 * (부모가 이 컴포넌트를 언마운트하지 않고 `error` prop만 바꾸는 구조라,
 * `error`가 truthy → falsy로 바뀌는 재시도 시점마다 0%부터 다시 시작한다).
 */
export function AiLoadingScreen({
  title,
  description,
  error,
  onRetry,
}: AiLoadingScreenProps) {
  const [progress, setProgress] = useState(0);

  // 부모가 이 컴포넌트를 언마운트하지 않고 `error`만 바꾸는 구조라, 재시도
  // (error: truthy → falsy) 시점을 렌더 중에 감지해 진행률을 0으로 되돌린다.
  // (React 권장 패턴: prop 변화에 따른 state 조정은 effect가 아니라 렌더 중에 한다.)
  const [prevError, setPrevError] = useState(error);
  if (error !== prevError) {
    setPrevError(error);
    if (!error) {
      setProgress(0);
    }
  }

  useEffect(() => {
    if (error) return;

    const intervalId = window.setInterval(() => {
      setProgress((prev) => prev + (95 - prev) * 0.07);
    }, 200);

    return () => window.clearInterval(intervalId);
  }, [error]);

  return (
    <div className="mx-auto flex w-full max-w-105 flex-col items-center px-6 pt-16 pb-24 text-center">
      <img src={cloudIcon} alt="" className="h-36.5 w-46" aria-hidden="true" />

      {error ? (
        <>
          <p className="mt-6 text-[16px] font-semibold text-[#e05b4e]">
            요청을 처리하지 못했어요.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 flex items-center gap-2 rounded-[9px] bg-[#e9f6e4] px-6 py-3 text-[14px] font-medium text-[#4fb75b]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            다시 시도
          </button>
        </>
      ) : (
        <>
          <p className="mt-6 text-[16px] font-semibold text-black">{title}</p>
          {description && (
            <p className="mt-3 text-[14px] leading-5.5 text-[#899086]">
              {description}
            </p>
          )}
          <div
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
            aria-label={title}
            className="mt-6 h-2 w-full max-w-70 overflow-hidden rounded-full bg-[#e9f6e4]"
          >
            <div
              className="h-full rounded-full bg-[#4fb75b] transition-[width] duration-200 ease-linear"
              style={{ width: `${progress}%` }}
            />
          </div>
        </>
      )}
    </div>
  );
}
