import type { PublicAnnouncement } from "@vlaad/shared";
import { supabaseAdmin } from "../lib/supabase";
import { ApiError } from "../utils/api-error";

type AnnouncementStatus = "active" | "archived" | "removed";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  category: string;
  created_at: string;
  metadata: {
    announcement?: boolean;
    announcementId?: string;
    sentAt?: string;
    label?: string;
    archived?: boolean;
    archivedAt?: string;
    removed?: boolean;
    removedAt?: string;
  } | null;
};

type AdminAnnouncementItem = PublicAnnouncement & {
  status: AnnouncementStatus;
};

function ensureSupabase() {
  if (!supabaseAdmin) {
    throw new ApiError(503, "Supabase is not configured for admin announcement management yet.");
  }

  return supabaseAdmin;
}

function resolveStatus(row: NotificationRow): AnnouncementStatus {
  if (row.metadata?.removed) {
    return "removed";
  }

  if (row.metadata?.archived) {
    return "archived";
  }

  return "active";
}

function buildLegacySignature(row: NotificationRow) {
  return `${row.title}::${row.body}::${(row.metadata?.sentAt ?? row.created_at).slice(0, 16)}`;
}

async function listAnnouncementRows() {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("notifications")
    .select("id, title, body, category, created_at, metadata")
    .eq("category", "emergency_broadcast")
    .order("created_at", { ascending: false })
    .limit(300);

  if (error) {
    throw new ApiError(500, "Failed to load admin announcements.", error.message);
  }

  return (data ?? []) as NotificationRow[];
}

export async function listAdminAnnouncements() {
  const rows = await listAnnouncementRows();
  const grouped = new Map<string, AdminAnnouncementItem>();

  for (const row of rows) {
    if (row.metadata?.announcement === false) {
      continue;
    }

    const groupKey = row.metadata?.announcementId ?? buildLegacySignature(row);

    if (grouped.has(groupKey)) {
      continue;
    }

    grouped.set(groupKey, {
      id: row.metadata?.announcementId ?? row.id,
      title: row.title,
      body: row.body,
      createdAt: row.metadata?.sentAt ?? row.created_at,
      label: row.metadata?.label ?? "Patch Notes",
      status: resolveStatus(row)
    });
  }

  return [...grouped.values()];
}

async function findMatchingRows(targetId: string) {
  const rows = await listAnnouncementRows();
  const primary = rows.find((row) => (row.metadata?.announcementId ?? row.id) === targetId);

  if (!primary) {
    throw new ApiError(404, "Announcement not found.");
  }

  if (primary.metadata?.announcementId) {
    return rows.filter((row) => row.metadata?.announcementId === primary.metadata?.announcementId);
  }

  const legacySignature = buildLegacySignature(primary);

  return rows.filter(
    (row) =>
      !row.metadata?.announcementId &&
      row.category === primary.category &&
      buildLegacySignature(row) === legacySignature
  );
}

async function updateAnnouncementRows(
  announcementId: string,
  updater: (metadata: NotificationRow["metadata"]) => NotificationRow["metadata"]
) {
  const client = ensureSupabase();
  const rows = await findMatchingRows(announcementId);

  await Promise.all(
    rows.map(async (row) => {
      const { error } = await client
        .from("notifications")
        .update({ metadata: updater(row.metadata ?? {}) })
        .eq("id", row.id);

      if (error) {
        throw new ApiError(500, "Failed to update announcement.", error.message);
      }
    })
  );
}

export async function setAnnouncementArchived(announcementId: string, archived: boolean) {
  const timestamp = new Date().toISOString();

  await updateAnnouncementRows(announcementId, (metadata) => ({
    ...(metadata ?? {}),
    archived,
    archivedAt: archived ? timestamp : null,
    removed: false,
    removedAt: null
  }));

  return { id: announcementId, archived };
}

export async function removeAnnouncement(announcementId: string) {
  const timestamp = new Date().toISOString();

  await updateAnnouncementRows(announcementId, (metadata) => ({
    ...(metadata ?? {}),
    removed: true,
    removedAt: timestamp
  }));

  return { id: announcementId, removed: true };
}
