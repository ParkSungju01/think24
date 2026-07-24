import type { InputHTMLAttributes, ReactNode } from 'react';

type MessageTone = 'error' | 'success' | 'hint';

interface AuthFieldProps
  extends Omit<
    InputHTMLAttributes<HTMLInputElement>,
    'id' | 'value' | 'onChange' | 'className'
  > {
  id: string;
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  /** 필드 안쪽(입력 텍스트 오른쪽)에 겹쳐 보여줄 요소. 예: 눈 아이콘 토글, 인증코드 카운트다운 */
  rightSlot?: ReactNode;
  /** 필드 바깥 오른쪽에 나란히 붙는 버튼. 예: 중복 확인, 인증 확인 */
  trailingAction?: ReactNode;
  /** 필드 하단 안내/에러/성공 문구 */
  message?: ReactNode;
  messageTone?: MessageTone;
  /** 피그마 실측값이 화면마다 44px/46px로 미세하게 달라 화면별로 지정 (기본 44px = h-11) */
  inputHeightClassName?: string;
}

const MESSAGE_TONE_CLASS: Record<MessageTone, string> = {
  error: 'text-[#e05b4e]',
  success: 'text-[#3e9b48]',
  hint: 'text-[#899086]',
};

// 로그인/회원가입/비밀번호 재설정 화면 공용 입력 필드 (docs/plans/login-signup.md "공통 텍스트 입력 필드 스타일")
export function AuthField({
  id,
  label,
  required,
  value,
  onChange,
  rightSlot,
  trailingAction,
  message,
  messageTone = 'hint',
  inputHeightClassName = 'h-11',
  ...inputProps
}: AuthFieldProps) {
  // message가 실제로 있을 때만 에러 테두리를 표시한다 (tone만 'error'로 미리 고정해 둔 채
  // message가 null/undefined인 초기 상태에서도 빨간 테두리가 뜨는 것을 방지)
  const hasError = messageTone === 'error' && Boolean(message);

  return (
    <div>
      <label
        htmlFor={id}
        className="mb-2 flex items-center text-[14px] font-medium text-[#1f2420]"
      >
        {label}
        {required && <span className="ml-0.5 text-[#e05b4e]">*</span>}
      </label>
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <input
            id={id}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`w-full ${inputHeightClassName} rounded-xl border bg-[#fafbf8] px-3.75 text-[15px] text-[#1f2420] outline-none transition-colors placeholder:text-[#adb3a9] focus:border-[#4fb75b] ${
              rightSlot ? 'pr-16' : ''
            } ${hasError ? 'border-[#e05b4e]' : 'border-[#e7eae4]'}`}
            {...inputProps}
          />
          {rightSlot && (
            <div className="absolute top-1/2 right-4 flex -translate-y-1/2 items-center gap-2">
              {rightSlot}
            </div>
          )}
        </div>
        {trailingAction}
      </div>
      {message && (
        <p
          className={`mt-2 flex items-center gap-1 text-[12px] ${MESSAGE_TONE_CLASS[messageTone]}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
