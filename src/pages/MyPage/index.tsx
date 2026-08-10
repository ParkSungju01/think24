import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import profileImg from '../../assets/profile.svg';
import { ConfirmModal } from '../../components/ConfirmModal';
import { Toast } from '../../components/Toast';
import { useAuth } from '../../contexts/AuthContext';
import { ROUTES } from '../../routes/paths';
import { getNicknameError } from '../../utils/nicknameValidation';

// 이슈 #25(웹 프로필 페이지) — docs/plans/mypage.md 피그마 실측 스펙(콘텐츠 1511px 기준)을
// xl(1024px+)에서 최대한 가깝게 재현하고, 그 미만은 자연스럽게 줄어들도록 처리한다
// (확인 완료 10번 — 전용 모바일 디자인 없음, 로그인/회원가입 웹 이슈 #21과 동일한 최소 대응).
// max-w-377.75(=1511px)는 Home 화면과 동일한 콘텐츠 상한값을 재사용해 두 화면의 폭 기준을 맞췄다.
const containerClassName =
  'mx-auto flex w-full max-w-377.75 flex-col px-4 pt-8 pb-16 lg:px-8 lg:pt-10 xl:px-26.75 xl:pt-19.5';

type ToastState = { message: string; tone: 'success' | 'error' } | null;

export function MyPage() {
  const { user, nickname, isNicknameLoading, updateNickname, signOut } =
    useAuth();
  const navigate = useNavigate();

  const [nicknameInput, setNicknameInput] = useState('');
  const hasInitializedRef = useRef(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toast, setToast] = useState<ToastState>(null);
  // 이슈 #27(모바일 프로필): 데스크톱은 로그아웃 버튼이 Sidebar에 있지만, 모바일은 이 페이지
  // 안에 별도 "로그아웃" 텍스트 버튼이 있어 확인 모달 오픈 상태가 이 컴포넌트에 추가로 필요하다.
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);

  // 닉네임은 AuthContext에서 비동기로 조회되므로, 로드가 끝난 시점에 딱 한 번만 입력창 초기값을
  // 채운다(이후 context의 nickname이 바뀌어도 — 예: 저장 성공 시 자기 자신이 갱신한 값과 같으므로
  // 문제 없지만, 사용자가 입력 중인 값을 덮어쓰지 않기 위해 최초 1회만 반영).
  useEffect(() => {
    if (hasInitializedRef.current || isNicknameLoading) return;
    const emailPrefix = user?.email?.split('@')[0] ?? '';
    setNicknameInput(nickname ?? emailPrefix);
    hasInitializedRef.current = true;
  }, [isNicknameLoading, nickname, user]);

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

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || isSubmitting) return;

    setIsSubmitting(true);
    const { error } = await updateNickname(nicknameInput);
    setIsSubmitting(false);

    setToast(
      error
        ? { message: '닉네임 저장에 실패했습니다.', tone: 'error' }
        : { message: '닉네임이 저장되었습니다.', tone: 'success' },
    );
  };

  // 이슈 #27: Sidebar.tsx의 handleLogout과 동일 패턴(모달 닫기 → signOut → 로그인으로 이동).
  const handleLogout = async () => {
    setIsLogoutModalOpen(false);
    await signOut();
    navigate(ROUTES.login);
  };

  return (
    <>
      {/* 모바일 레이아웃 (< 426px, 피그마 "프로필" 섹션 264:890~264:1443 — 프로필 수정 카드 +
          로그아웃 텍스트 버튼. docs/plans/mobile-profile.md 실측 스펙, 닉네임 로직/로그아웃
          로직은 아래 데스크톱 블록과 완전히 동일한 상태/핸들러를 그대로 공유한다). */}
      <div className="flex flex-col px-6 pt-8 pb-24 lg:hidden">
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
              disabled={!canSubmit || isSubmitting}
              className={`mx-auto mt-8 h-8.25 w-46.75 rounded-[9px] text-[15px] font-medium transition-colors ${submitColorClassName} ${
                !canSubmit || isSubmitting ? 'cursor-not-allowed' : ''
              }`}
            >
              수정하기
            </button>
          </form>
        </div>

        {/* "로그아웃" 텍스트 버튼(264:1356) — 클릭 시 확인 모달 오픈(264:1370 스펙).
            시각적 텍스트는 46×16으로 작지만 py-3로 터치 영역을 넉넉히 확보(확인 필요 #2 제안 승계). */}
        <button
          type="button"
          onClick={() => setIsLogoutModalOpen(true)}
          className="mx-auto mt-16.25 px-4 py-3 text-[12px] font-medium text-[#899086]"
        >
          로그아웃
        </button>
      </div>

      {/* 데스크톱 레이아웃 (기존 구현 그대로 — hidden lg:flex 래퍼만 추가, 내부 마크업/클래스 변경 없음) */}
      <div className="hidden lg:flex">
        <div className={containerClassName}>
          <h1 className="text-[26px] font-semibold text-black lg:text-[34px] xl:text-[50px]">
            프로필 수정
          </h1>

          {/* 아바타(423×423, profile.svg 고정) + "프로필 사진 변경" 버튼(확인 완료 3번: no-op).
              버튼은 아바타 하단 가장자리와 겹치도록 배치돼 있어(피그마 실측: 버튼 중심이 아바타
              바닥에서 위로 27px), 크기가 바뀌어도 비율이 유지되도록 %(bottom-[6.4%])로 위치를 잡았다. */}
          <div className="relative mx-auto mt-6 aspect-square w-40 sm:w-52 lg:w-64 xl:mt-7.5 xl:w-105.75">
            <img
              src={profileImg}
              alt="프로필 이미지"
              className="h-full w-full rounded-full object-cover"
            />
          </div>

          <form
            onSubmit={handleSubmit}
            noValidate
            className="mt-10 flex flex-col xl:mt-14.75"
          >
            {/* 리뷰 재작업(가운데 정렬): 라벨/입력창을 731px 폭(w-182.75) 컬럼 하나로 묶어서 함께
                mx-auto로 콘텐츠 영역 중앙에 오게 한다 — 이전엔 input에만 max-w를 줘서 폭은
                좁아졌지만 중앙으로 이동시키는 auto margin이 없어 왼쪽에 그대로 붙어 있었고,
                라벨은 아예 폭 제한이 없어 컨테이너 맨 왼쪽(타이틀과 같은 줄)에 붙어 보였다. */}
            <div className="mx-auto w-full max-w-182.75">
              <label
                htmlFor="mypage-nickname"
                className="text-[18px] font-semibold text-black xl:text-[35px]"
              >
                닉네임
              </label>
              <input
                id="mypage-nickname"
                value={nicknameInput}
                onChange={(event) => setNicknameInput(event.target.value)}
                maxLength={10}
                className={`mt-3 h-11 w-full rounded-[7px] border bg-white px-4 text-[15px] text-black outline-none xl:mt-4 xl:h-15 xl:px-8 xl:text-[30px] ${borderColorClassName}`}
              />
              {/* 리뷰 재작업: 형식 오류(특수문자/공백 등) 시 테두리 색상만이 아니라 에러 문구도 노출.
                  피그마 264:1547 실측(Inter Regular 18px, #e05b4e)과 색상/크기를 맞췄다. 빈 값은
                  getNicknameError가 null을 반환하므로 자연히 표시되지 않는다.
                  정렬: 264:1547 좌표 실측 결과 입력창 왼쪽 끝과는 403px 어긋나지만 오른쪽 끝과는
                  33px(입력창 폭의 4.5%)만 차이 나 우측 정렬로 판단, text-right 적용. */}
              {nicknameError && (
                <p className="mt-3.5 text-right text-[13px] text-[#e05b4e] xl:text-[18px]">
                  한글/영문/숫자만 허용(특수문자, 공백 불가)
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={!canSubmit || isSubmitting}
              className={`mx-auto mt-8 h-11 w-full max-w-78 rounded-[9px] text-[15px] font-medium transition-colors xl:mt-24.25 xl:h-13.5 xl:text-[33px] ${submitColorClassName} ${
                !canSubmit || isSubmitting ? 'cursor-not-allowed' : ''
              }`}
            >
              수정하기
            </button>
          </form>
        </div>
      </div>

      {/* 두 블록이 공유하는 오버레이(닉네임 저장 토스트 + 로그아웃 확인 모달) — 특정 블록 안에
          중첩하면 그 블록이 display:none일 때 함께 숨어버리므로 최상위 형제로 뺐다. */}
      {toast && (
        <Toast
          message={toast.message}
          tone={toast.tone}
          onDismiss={() => setToast(null)}
        />
      )}

      {isLogoutModalOpen && (
        <ConfirmModal
          message="로그아웃 하시겠습니까?"
          onConfirm={handleLogout}
          onCancel={() => setIsLogoutModalOpen(false)}
        />
      )}
    </>
  );
}

export default MyPage;
