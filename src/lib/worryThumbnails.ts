import { supabase } from './supabase';

const BUCKET = 'worry-thumbnails';
// Supabase Storage 오브젝트 키 문자 제한과 무관하게 항상 안전한 확장자만 남긴다.
const SAFE_EXTENSION_PATTERN = /^[a-z0-9]{1,10}$/;
const MIME_TO_EXTENSION: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/gif': 'gif',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};

/**
 * 원본 파일명을 그대로 오브젝트 키에 쓰면 한글/공백/괄호 등이 섞인 실제 파일명(예:
 * "테스트 이미지 (1).png")에서 Supabase Storage가 "Invalid key"(400)로 업로드를 거부한다
 * (실사용 중 발견 — 재현 완료). 확장자만 뽑아 안전한 문자만 남기고, 나머지는 버린다.
 */
function extractSafeExtension(file: File): string {
  const dotIndex = file.name.lastIndexOf('.');
  const rawExt =
    dotIndex >= 0 ? file.name.slice(dotIndex + 1).toLowerCase() : '';

  if (SAFE_EXTENSION_PATTERN.test(rawExt)) {
    return rawExt;
  }

  return MIME_TO_EXTENSION[file.type] ?? 'bin';
}

/**
 * docs/plans/new-worry.md "데이터 모델 변경 > 2. Storage 버킷 신설": 상품 이미지를
 * `worry-thumbnails` 버킷의 `{user_id}/{timestamp}-{랜덤id}.{확장자}` 경로에 업로드하고
 * 공개 URL을 반환한다. 원본 파일명은 오브젝트 키에 쓰지 않는다(위 함수 설명 참고 — 안전한
 * 확장자만 뽑아 쓰고 나머지는 타임스탬프+랜덤 id로 대체해 문자 인코딩 문제를 원천 차단한다).
 * RLS가 `auth.uid()`와 폴더명(`user_id`) 일치를 요구하므로 userId는 반드시 로그인한
 * 본인 id여야 한다.
 */
export async function uploadWorryThumbnail(
  userId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  const extension = extractSafeExtension(file);
  const path = `${userId}/${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, file);

  if (uploadError) {
    return { url: null, error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { url: publicUrl, error: null };
}
