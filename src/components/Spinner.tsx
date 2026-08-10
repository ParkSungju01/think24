interface SpinnerProps {
  /** 기본 20px(h-5 w-5). 버튼 안에 넣을 땐 흰 테두리, 그 외엔 브랜드 그린 사용 */
  className?: string;
}

// 피그마에 로딩 상태의 구체적인 비주얼이 없어 신규 구현한 CSS 스피너 (사용자 확인 완료)
export function Spinner({ className = 'h-5 w-5 border-white' }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label="로딩 중"
      className={`inline-block animate-spin rounded-full border-2 border-t-transparent ${className}`}
    />
  );
}
