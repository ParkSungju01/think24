import logo from '../assets/logo.svg';

interface WorryThumbnailProps {
  /** null/빈 값이면 로고 기본 썸네일로 대체한다 */
  src: string | null | undefined;
  alt: string;
  /** 크기(h-*, w-*)와 모양(rounded-*) 클래스만 호출부에서 넘긴다. shrink-0은 이 컴포넌트가 고정 부착. */
  sizeClassName: string;
}

/**
 * 고민(상품) 썸네일 공용 렌더러. 사용자가 이미지를 등록하지 않은 경우(thumbnailUrl===null)
 * 빈 회색 박스 대신 앱 배경색(#eefff0, AppLayout과 동일)을 바탕으로 브랜드 로고를 보여준다.
 * WorryListItem(홈)/WorryCard(고민목록)/NotificationSwipeableListItem(알림)이 공유한다.
 */
export function WorryThumbnail({ src, alt, sizeClassName }: WorryThumbnailProps) {
  if (src) {
    return (
      <img
        src={src}
        alt={alt}
        className={`${sizeClassName} shrink-0 object-cover`}
      />
    );
  }

  return (
    <div
      className={`${sizeClassName} flex shrink-0 items-center justify-center bg-[#eefff0]`}
      aria-hidden="true"
    >
      <img src={logo} alt="" className="h-1/2 w-1/2 object-contain" />
    </div>
  );
}
