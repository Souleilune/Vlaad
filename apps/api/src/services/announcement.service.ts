import type { PublicAnnouncement } from "@vlaad/shared";
import { supabaseAdmin } from "../lib/supabase";
import { ApiError } from "../utils/api-error";

type AnnouncementRow = {
  id: string;
  title: string;
  body: string;
  created_at: string;
  metadata: {
    announcement?: boolean;
    announcementId?: string;
    sentAt?: string;
    label?: string;
    archived?: boolean;
    removed?: boolean;
  } | null;
};

function ensureSupabase() {
  if (!supabaseAdmin) {
    throw new ApiError(503, "Supabase is not configured for public announcements yet.");
  }

  return supabaseAdmin;
}

export async function listPublicAnnouncements() {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("notifications")
    .select("id, title, body, created_at, metadata")
    .eq("category", "emergency_broadcast")
    .order("created_at", { ascending: false })
    .limit(200);

  if (error) {
    throw new ApiError(500, "Failed to load public announcements.", error.message);
  }

  const unique = new Map<string, PublicAnnouncement>();

  for (const row of (data ?? []) as AnnouncementRow[]) {
    if (row.metadata?.announcement === false) {
      continue;
    }

    if (row.metadata?.archived || row.metadata?.removed) {
      continue;
    }

    const dedupeKey =
      row.metadata?.announcementId ??
      `${row.title}::${row.body}::${row.metadata?.sentAt ?? row.created_at.slice(0, 16)}`;

    if (unique.has(dedupeKey)) {
      continue;
    }

    unique.set(dedupeKey, {
      id: row.metadata?.announcementId ?? row.id,
      title: row.title,
      body: row.body,
      createdAt: row.metadata?.sentAt ?? row.created_at,
      label: row.metadata?.label ?? "Platform Update"
    });
  }

  return [...unique.values()].slice(0, 8);
}
