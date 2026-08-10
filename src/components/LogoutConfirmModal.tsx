import { X } from 'lucide-react';

interface LogoutConfirmModalProps {
  /** "네" 클릭 시 실행 (로그아웃 실행 + 모달 닫기는 호출부 책임) */
  onConfirm: () => void;
  /** "아니요" 또는 우측 상단 닫기(X) 클릭 시 실행 (모달 닫기만) */
  onCancel: () => void;
}

/**
 * 웹 전용 로그아웃 확인 모달.
 *
 * docs/plans/mypage.md 최초 계획엔 "웹 피그마엔 확인 모달이 없고 모바일에만 있다"고 기록돼
 * 있었는데, 사용자 재확인 요청으로 다시 훑어보니 웹 마이페이지 화면의 상태 변형 중 하나
 * (피그마 `264:1623` 근처, x≈-3206~-1287/y≈10061~11141 — 기존에 "기본 상태와 동일한 중복본"으로
 * 판단해 건너뛴 변형 위에 모달이 얹혀 있었다)에 이 디자인이 실제로 존재해 새로 반영한다.
 *
 * 모바일 알림(이슈 #17)에서 재사용 중인 `ConfirmModal`(260×100, 두 버튼 모두 초록)과는 전혀 다른
 * 디자인이라 별도 컴포넌트로 분리했다: 659×213 카드, 우측 상단 X 닫기, "네"(흰 배경 + 회색 테두리)/
 * "아니요"(초록 배경 `#729e59` + 흰 텍스트) 버튼. "아니요"가 오히려 강조된 초록 버튼인 것도 피그마
 * 그대로 반영했다 — 실수로 로그아웃하지 않도록 "취소"를 시각적으로 유도하는 의도로 보인다.
 */
export function LogoutConfirmModal({
  onConfirm,
  onCancel,
}: LogoutConfirmModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      role="dialog"
      aria-modal="true"
      onClick={onCancel}
    >
      <div
        className="relative flex w-164.75 max-w-full flex-col items-center gap-11.75 rounded-[11px] bg-white pt-12.25 pb-9.5 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.04),0px_1px_1px_0px_rgba(0,0,0,0.02)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onCancel}
          aria-label="닫기"
          className="absolute top-4 right-4 text-[#666]"
        >
          <X className="h-7 w-7" strokeWidth={2} />
        </button>

        <p className="text-[35px] font-bold text-black">
          로그아웃 하시겠습니까?
        </p>

        <div className="flex gap-43.75">
          <button
            type="button"
            onClick={onConfirm}
            className="h-12.75 w-46.5 rounded-md border border-[#d9d9d9] bg-white text-[28px] font-medium text-[#666]"
          >
            네
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="h-12.75 w-46.5 rounded-md bg-[#729e59] text-[28px] font-medium text-white"
          >
            아니요
          </button>
        </div>
      </div>
    </div>
  );
}
