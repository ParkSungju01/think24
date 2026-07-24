import type { ReactNode } from 'react';
import { Spinner } from '../Spinner';

interface SubmitButtonProps {
  children: ReactNode;
  /** 폼 유효성 통과 여부 — 배경색(그린/그레이)을 결정한다 */
  active: boolean;
  isSubmitting?: boolean;
  type?: 'submit' | 'button';
  onClick?: () => void;
}

// 로그인/가입하기/멈칫 시작하기 버튼 공용 스타일 (활성 #4FB75B / 비활성 #E7EAE4)
export function SubmitButton({
  children,
  active,
  isSubmitting = false,
  type = 'submit',
  onClick,
}: SubmitButtonProps) {
  const disabled = !active || isSubmitting;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-12.75 w-full items-center justify-center rounded-xl text-[16px] font-bold text-white transition-colors ${
        active ? 'bg-[#4fb75b]' : 'cursor-not-allowed bg-[#e7eae4]'
      }`}
    >
      {isSubmitting ? <Spinner /> : children}
    </button>
  );
}
