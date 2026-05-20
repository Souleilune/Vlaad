import type { NotificationItem } from "@vlaad/shared";
import { supabaseAdmin } from "../lib/supabase";
import { ApiError } from "../utils/api-error";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  read_at: string | null;
  category: NotificationItem["category"];
};

function ensureSupabase() {
  if (!supabaseAdmin) {
    throw new ApiError(503, "Supabase is not configured for notifications yet.");
  }

  return supabaseAdmin;
}

function mapNotification(row: NotificationRow): NotificationItem {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    readAt: row.read_at,
    category: row.category
  };
}

export async function listNotifications(userId: string) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("notifications")
    .select("id, title, body, created_at, read_at, category")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(25);

  if (error) {
    throw new ApiError(500, "Failed to load notifications.", error.message);
  }

  return (data ?? []).map((row) => mapNotification(row as NotificationRow));
}

export async function markNotificationRead(userId: string, notificationId: string) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("notifications")
    .update({ read_at: new Date().toISOString() })
    .eq("id", notificationId)
    .eq("user_id", userId)
    .is("read_at", null)
    .select("id, title, body, created_at, read_at, category")
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to mark notification as read.", error.message);
  }

  if (!data) {
    const { data: existing, error: existingError } = await client
      .from("notifications")
      .select("id, title, body, created_at, read_at, category")
      .eq("id", notificationId)
      .eq("user_id", userId)
      .maybeSingle();

    if (existingError) {
      throw new ApiError(500, "Failed to load notification after update.", existingError.message);
    }

    if (!existing) {
      throw new ApiError(404, "Notification not found.");
    }

    return mapNotification(existing as NotificationRow);
  }

  return mapNotification(data as NotificationRow);
}
