// docs/plans/local-only-migration.md "4. 상품 썸네일 로컬 저장": Supabase Storage 업로드 대신
// 리사이즈 후 base64 data URL을 반환하는 순수 프론트 로직으로 재작성했다. object URL은 현재
// 세션의 메모리에만 유효해 새로고침하면 깨지므로, localStorage에 저장해도 재방문 시 유지되는
// data URL을 선택했다.

const MAX_DIMENSION = 480; // px, 긴 쪽 기준
const JPEG_QUALITY = 0.72;

export async function uploadWorryThumbnail(
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  try {
    const dataUrl = await resizeToDataUrl(file, MAX_DIMENSION, JPEG_QUALITY);
    return { url: dataUrl, error: null };
  } catch (err) {
    console.error('썸네일 리사이즈 실패:', err);
    return { url: null, error: '이미지 처리에 실패했습니다.' };
  }
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('파일을 읽지 못했습니다.'));
      }
    };
    reader.onerror = () => reject(reader.error ?? new Error('파일을 읽지 못했습니다.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('이미지를 불러오지 못했습니다.'));
    image.src = src;
  });
}

async function resizeToDataUrl(
  file: File,
  maxDimension: number,
  quality: number,
): Promise<string> {
  const originalDataUrl = await readFileAsDataUrl(file);
  const image = await loadImage(originalDataUrl);

  const longestSide = Math.max(image.width, image.height);
  const scale = longestSide > maxDimension ? maxDimension / longestSide : 1;
  const targetWidth = Math.round(image.width * scale);
  const targetHeight = Math.round(image.height * scale);

  const canvas = document.createElement('canvas');
  canvas.width = targetWidth;
  canvas.height = targetHeight;

  const context = canvas.getContext('2d');
  if (!context) {
    throw new Error('canvas context를 생성하지 못했습니다.');
  }
  context.drawImage(image, 0, 0, targetWidth, targetHeight);

  return canvas.toDataURL('image/jpeg', quality);
}
