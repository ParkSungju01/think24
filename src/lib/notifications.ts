import { supabase } from './supabase';
import type { NotificationItem } from '../types/notifications';

// 이슈 #31: 더미 데이터(dummyNotifications) 제거, public.notifications 테이블 기반 실쿼리로 전환.
// 스키마/RLS는 이번 이슈에서 사용자가 Supabase SQL Editor에 직접 실행했다 (docs/plans/notifications.md,
// docs/plans/mobile-notifications.md의 "실제 연동은 별도 이슈로 미룬다" 항목의 후속 작업).
// worries.ts의 WorryRecord/WorryRow 패턴(snake_case row → camelCase record 정규화)을 그대로 따른다.
//
// 범위: 조회/읽음처리/전체읽음/개별삭제/전체삭제 CRUD만 다룬다. 알림이 자동으로 생성되는 트리거/
// 스케줄링 로직(타이머 만료 등)은 이번 범위 밖이라 여기서 insert 함수는 만들지 않는다 — 테이블은
// 처음엔 비어 있고, SQL Editor로 직접 넣은 테스트 row로 검증한다.

interface NotificationRow {
  id: string;
  worry_id: string | null;
  worry_name: string;
  message: string;
  thumbnail_url: string | null;
  is_read: boolean;
  created_at: string;
}

const SELECT_COLUMNS =
  'id, worry_id, worry_name, message, thumbnail_url, is_read, created_at';

function toNotificationItem(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    worryId: row.worry_id,
    worryName: row.worry_name,
    message: row.message,
    thumbnailUrl: row.thumbnail_url,
    isRead: row.is_read,
    createdAt: new Date(row.created_at),
  };
}

/** 로그인한 유저의 알림을 최신순(created_at desc)으로 조회한다. */
export async function fetchNotifications(
  userId: string,
): Promise<NotificationItem[]> {
  const { data, error } = await supabase
    .from('notifications')
    .select(SELECT_COLUMNS)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  return (data ?? []).map(toNotificationItem);
}

/** 알림 아이템 클릭 시 해당 알림 1건만 읽음 처리한다 (웹/모바일 공통, 확인 완료: 이동 없음). */
export async function markAsRead(id: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', id);
  return { error: error?.message ?? null };
}

/** 모바일 오버플로우 메뉴 "모두 읽음으로 표시" — 로그인한 유저의 안읽은 알림을 전부 읽음 처리한다. */
export async function markAllAsRead(
  userId: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId)
    .eq('is_read', false);
  return { error: error?.message ?? null };
}

/** 모바일 개별 삭제 확인 모달 "네" — 알림 1건만 삭제한다. */
export async function deleteNotification(
  id: string,
): Promise<{ error: string | null }> {
  const { error } = await supabase.from('notifications').delete().eq('id', id);
  return { error: error?.message ?? null };
}

/** 모바일 오버플로우 메뉴 "알림 전체 삭제" → 확인 모달 "네" — 로그인한 유저의 알림을 전부 삭제한다. */
export async function deleteAll(userId: string): Promise<{ error: string | null }> {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);
  return { error: error?.message ?? null };
}
