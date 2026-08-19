import { useState, type FormEvent } from 'react';
import profileImg from '../../assets/profile.svg';
import { Toast } from '../../components/Toast';
import { useNickname } from '../../contexts/NicknameContext';
import { getNicknameError } from '../../utils/nicknameValidation';

type ToastState = { message: string; tone: 'success' | 'error' } | null;

export function MyPage() {
  const { nickname, updateNickname } = useNickname();

  // 닉네임은 이제 NicknameContext가 동기적으로 항상 보관하므로, 로딩 종료를 기다리는
  // useEffect+ref 패턴 없이 useState 초기값으로 바로 채울 수 있다.
  const [nicknameInput, setNicknameInput] = useState(nickname);
  const [toast, setToast] = useState<ToastState>(null);

  // docs/plans/mypage.md 닉네임 유효성 상태 표: 빈 값은 에러 아님(회색 테두리), 형식/금칙어
  // 위반만 에러(빨간 테두리) — getNicknameError가 빈 문자열에 null을 반환하므로 그대로 매핑된다.
  const nicknameError = getNicknameError(nicknameInput);
  const canSubmit = nicknameInput.length > 0 && nicknameError === null;

  const borderColorClassName = nicknameError
    ? 'border-[#e05b4e]'
    : 'border-[#757575]';
  const submitColorClassName = canSubmit
    ? 'bg-[#e9f6e4] text-[#4fb75b]'
    : 'bg-[#e7eae4] text-[#504f4f]';

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit) return;

    // 로컬 쓰기는 실패하지 않으므로(updateNickname이 동기) 항상 성공 토스트만 보여준다.
    updateNickname(nicknameInput);
    setToast({ message: '닉네임이 저장되었습니다.', tone: 'success' });
  };

  return (
    <>
      {/* 이슈 #39: 모바일 레이아웃(피그마 "프로필" 섹션 264:890~264:1443 — 프로필 수정 카드.
          docs/plans/mobile-profile.md 실측 스펙)만 남기고 데스크톱 레이아웃은 삭제했다.
          이슈 #48: 계정 자체가 사라져 로그아웃 텍스트 버튼/확인 모달은 완전히 제거했다. */}
      <div className="flex flex-col px-6 pt-8 pb-24">
        <h1 className="text-[25px] font-semibold text-black">프로필 수정</h1>

        <div className="mt-6 w-full rounded-[17px] border border-[#dedede] bg-white pb-5">
          {/* 아바타(208×208=w-52 h-52) + "프로필 사진 변경" 버튼(확인 완료 3번 승계: no-op).
              버튼이 아바타 하단 가장자리와 27px 겹치도록 배치돼 있어(피그마 실측),
              음수 마진(-mt-6.75=-27px)으로 그 겹침을 그대로 재현했다. */}
          <div className="flex flex-col items-center pt-7.75">
            <img
              src={profileImg}
              alt="프로필 이미지"
              className="h-52 w-52 rounded-full object-cover"
            />
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-5 flex flex-col px-7"
          >
            <label
              htmlFor="mypage-nickname-mobile"
              className="text-[17px] font-semibold text-black"
            >
              닉네임
            </label>
            <input
              id="mypage-nickname-mobile"
              value={nicknameInput}
              onChange={(event) => setNicknameInput(event.target.value)}
              maxLength={10}
              className={`mt-3 h-10.25 w-full rounded-[7px] border bg-white px-4 text-[17px] text-black outline-none ${borderColorClassName}`}
            />
            {nicknameError && (
              <p className="mt-2 text-[11px] text-[#e05b4e]">
                한글/영문/숫자만 허용 (특수문자·공백 불가)
              </p>
            )}
            <button
              type="submit"
              disabled={!canSubmit}
              className={`mx-auto mt-8 h-8.25 w-46.75 rounded-[9px] text-[15px] font-medium cursor-pointer transition-colors ${submitColorClassName} ${
                !canSubmit ? 'cursor-not-allowed' : ''
              }`}
            >
              수정하기
            </button>
          </form>
        </div>
      </div>

      {/* 닉네임 저장 토스트 — 위 레이아웃 div와 같은 최상위 형제로 둔다. */}
      {toast && (
        <Toast
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => setToast(null)}
        />
      )}
    </>
  );
}

export default MyPage;
