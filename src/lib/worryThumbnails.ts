import { supabase } from './supabase';

const BUCKET = 'worry-thumbnails';

/**
 * docs/plans/new-worry.md "데이터 모델 변경 > 2. Storage 버킷 신설": 상품 이미지를
 * `worry-thumbnails` 버킷의 `{user_id}/{timestamp}-{원본파일명}` 경로에 업로드하고
 * 공개 URL을 반환한다. RLS가 `auth.uid()`와 폴더명(`user_id`) 일치를 요구하므로
 * userId는 반드시 로그인한 본인 id여야 한다.
 */
export async function uploadWorryThumbnail(
  userId: string,
  file: File,
): Promise<{ url: string | null; error: string | null }> {
  const path = `${userId}/${Date.now()}-${file.name}`;

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
