import { RefreshCw } from 'lucide-react';
import cloudIcon from '../../../assets/cloud.svg';
import { Spinner } from '../../../components/Spinner';

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
 */
export function AiLoadingScreen({
  title,
  description,
  error,
  onRetry,
}: AiLoadingScreenProps) {
  return (
    <div className="mx-auto flex w-full max-w-105 flex-col items-center px-6 pt-16 pb-24 text-center lg:pt-24 xl:max-w-140 xl:pt-32">
      <img
        src={cloudIcon}
        alt=""
        className="h-36.5 w-46 xl:h-45.5 xl:w-57.5"
        aria-hidden="true"
      />

      {error ? (
        <>
          <p className="mt-6 text-[16px] font-semibold text-[#e05b4e] xl:text-[24px]">
            요청을 처리하지 못했어요.
          </p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-6 flex items-center gap-2 rounded-[9px] bg-[#e9f6e4] px-6 py-3 text-[14px] font-medium text-[#4fb75b] xl:text-[20px]"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            다시 시도
          </button>
        </>
      ) : (
        <>
          <div className="mt-6 flex items-center gap-2">
            <Spinner className="h-5 w-5 border-[#4fb75b]" />
            <p className="text-[16px] font-semibold text-black xl:text-[24px]">
              {title}
            </p>
          </div>
          {description && (
            <p className="mt-3 text-[14px] leading-5.5 text-[#899086] xl:text-[18px]">
              {description}
            </p>
          )}
        </>
      )}
    </div>
  );
}
