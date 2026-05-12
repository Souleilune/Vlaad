import type { UserRole, VerifiedSource } from "@vlaad/shared";
import { supabaseAdmin } from "../lib/supabase";
import { ApiError } from "../utils/api-error";

type UserProfileRow = {
  id: string;
  full_name: string;
  blood_type: string | null;
  city: string | null;
  created_at: string;
};

type UserRoleRow = {
  user_id: string;
  role: UserRole;
  users: UserProfileRow[] | null;
};

type ReportRow = {
  id: string;
  title: string;
  blood_type: string;
  source_type: string;
  verification_status: string;
  address: string;
  available_bags: number;
  created_at: string;
  expires_at: string;
  organization_name: string | null;
  nickname: string | null;
  is_emergency: boolean;
};

type ReportFlagRow = {
  report_id: string;
};

type VerifiedSourceRow = {
  id: string;
  name: string;
  source_type: VerifiedSource["sourceType"];
  address: string;
  latitude: number;
  longitude: number;
  contact_number: string | null;
  is_active: boolean;
  badge_label: string;
};

function ensureSupabase() {
  if (!supabaseAdmin) {
    throw new ApiError(503, "Supabase is not configured for admin operations yet.");
  }

  return supabaseAdmin;
}

function mapVerifiedSource(row: VerifiedSourceRow): VerifiedSource {
  return {
    id: row.id,
    name: row.name,
    sourceType: row.source_type,
    address: row.address,
    location: {
      lat: Number(row.latitude),
      lng: Number(row.longitude)
    },
    contactNumber: row.contact_number,
    isActive: Boolean(row.is_active),
    badgeLabel: row.badge_label
  };
}

export async function getUserRole(userId: string): Promise<UserRole> {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to resolve user role.", error.message);
  }

  return (data?.role as UserRole | undefined) ?? "user";
}

export async function listAdminUsers() {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("user_roles")
    .select("user_id, role, users:user_id(id, full_name, blood_type, city, created_at)")
    .order("created_at", { ascending: false, foreignTable: "users" });

  if (error) {
    throw new ApiError(500, "Failed to load admin user list.", error.message);
  }

  return ((data ?? []) as unknown as UserRoleRow[]).map((row) => {
    const profile = row.users?.[0] ?? null;

    return {
      id: row.user_id,
      role: row.role,
      fullName: profile?.full_name ?? "Unnamed user",
      bloodType: profile?.blood_type ?? null,
      city: profile?.city ?? null,
      createdAt: profile?.created_at ?? null
    };
  });
}

export async function updateUserRole(userId: string, role: Extract<UserRole, "user" | "admin">) {
  const client = ensureSupabase();
  const { error } = await client.from("user_roles").upsert({
    user_id: userId,
    role
  });

  if (error) {
    throw new ApiError(500, "Failed to update user role.", error.message);
  }

  return { id: userId, role };
}

export async function queueAnnouncement(title: string, body: string) {
  const client = ensureSupabase();
  const { data: users, error: usersError } = await client.from("users").select("id");

  if (usersError) {
    throw new ApiError(500, "Failed to load recipients for announcement.", usersError.message);
  }

  const recipients = users ?? [];

  if (!recipients.length) {
    return { delivered: 0 };
  }

  const payload = recipients.map((user) => ({
    user_id: user.id,
    category: "system",
    title,
    body,
    metadata: { announcement: true }
  }));

  const { error } = await client.from("notifications").insert(payload);

  if (error) {
    throw new ApiError(500, "Failed to queue announcement.", error.message);
  }

  return { delivered: payload.length };
}

export async function getAnalyticsOverview() {
  const client = ensureSupabase();
  const nowIso = new Date().toISOString();
  const thirtyDaysAgoIso = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

  const [
    totalReportsResult,
    activeReportsResult,
    allActiveReportsResult,
    activeEmergenciesResult,
    resolvedEmergenciesResult,
    recentUsersResult
  ] = await Promise.all([
    client.from("blood_reports").select("id", { count: "exact", head: true }),
    client
      .from("blood_reports")
      .select("available_bags")
      .in("verification_status", ["pending", "verified"])
      .gt("expires_at", nowIso),
    client.from("blood_reports").select("verification_status"),
    client
      .from("emergency_requests")
      .select("id", { count: "exact", head: true })
      .in("status", ["open", "matched"]),
    client
      .from("emergency_requests")
      .select("id", { count: "exact", head: true })
      .eq("status", "resolved"),
    client
      .from("users")
      .select("id", { count: "exact", head: true })
      .gte("created_at", thirtyDaysAgoIso)
  ]);

  for (const result of [
    totalReportsResult,
    activeReportsResult,
    allActiveReportsResult,
    activeEmergenciesResult,
    resolvedEmergenciesResult,
    recentUsersResult
  ]) {
    if (result.error) {
      throw new ApiError(500, "Failed to load analytics overview.", result.error.message);
    }
  }

  const totalReports = totalReportsResult.count ?? 0;
  const activeBloodAvailability = (activeReportsResult.data ?? []).reduce(
    (sum, row) => sum + Number(row.available_bags ?? 0),
    0
  );
  const activeEmergencies = activeEmergenciesResult.count ?? 0;
  const resolvedRequests = resolvedEmergenciesResult.count ?? 0;
  const userGrowth = recentUsersResult.count ?? 0;
  const moderationBase = (allActiveReportsResult.data ?? []).length;
  const verifiedCount = (allActiveReportsResult.data ?? []).filter(
    (row) => row.verification_status === "verified"
  ).length;
  const verificationRate = moderationBase ? Number(((verifiedCount / moderationBase) * 100).toFixed(1)) : 0;

  return {
    totalReports,
    activeBloodAvailability,
    activeEmergencies,
    resolvedRequests,
    userGrowth,
    verificationRate
  };
}

export async function getAnalyticsHeatmap() {
  const client = ensureSupabase();
  const nowIso = new Date().toISOString();
  const [reportsResult, emergenciesResult] = await Promise.all([
    client
      .from("blood_reports")
      .select("id, title, latitude, longitude, available_bags, city")
      .in("verification_status", ["pending", "verified"])
      .gt("expires_at", nowIso),
    client
      .from("emergency_requests")
      .select("id, title, latitude, longitude, urgency_level, city, status")
      .in("status", ["open", "matched"])
  ]);

  if (reportsResult.error) {
    throw new ApiError(500, "Failed to load report heatmap data.", reportsResult.error.message);
  }

  if (emergenciesResult.error) {
    throw new ApiError(500, "Failed to load emergency heatmap data.", emergenciesResult.error.message);
  }

  const reportItems = (reportsResult.data ?? []).map((row) => ({
    id: row.id,
    label: row.title ?? "Blood availability",
    city: row.city ?? null,
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    type: "report" as const,
    weight: Math.max(1, Number(row.available_bags ?? 1))
  }));

  const urgencyWeight: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4
  };

  const emergencyItems = (emergenciesResult.data ?? []).map((row) => ({
    id: row.id,
    label: row.title ?? "Emergency request",
    city: row.city ?? null,
    lat: Number(row.latitude),
    lng: Number(row.longitude),
    type: "emergency" as const,
    weight: urgencyWeight[row.urgency_level] ?? 1
  }));

  return { items: [...reportItems, ...emergencyItems] };
}

export async function listModerationQueue() {
  const client = ensureSupabase();
  const [reportsResult, flagsResult] = await Promise.all([
    client
      .from("blood_reports")
      .select(
        "id, title, blood_type, source_type, verification_status, address, available_bags, created_at, expires_at, organization_name, nickname, is_emergency"
      )
      .eq("verification_status", "pending")
      .order("created_at", { ascending: true })
      .limit(25),
    client.from("report_flags").select("report_id")
  ]);

  if (reportsResult.error) {
    throw new ApiError(500, "Failed to load moderation queue.", reportsResult.error.message);
  }

  if (flagsResult.error) {
    throw new ApiError(500, "Failed to load report flags.", flagsResult.error.message);
  }

  const flagsByReportId = new Map<string, number>();

  for (const flag of (flagsResult.data ?? []) as ReportFlagRow[]) {
    flagsByReportId.set(flag.report_id, (flagsByReportId.get(flag.report_id) ?? 0) + 1);
  }

  return ((reportsResult.data ?? []) as ReportRow[]).map((row) => ({
    id: row.id,
    title: row.title,
    bloodType: row.blood_type,
    sourceType: row.source_type,
    verificationStatus: row.verification_status,
    address: row.address,
    availableBags: Number(row.available_bags),
    createdAt: row.created_at,
    expiresAt: row.expires_at,
    organizationName: row.organization_name,
    nickname: row.nickname,
    isEmergency: Boolean(row.is_emergency),
    flagCount: flagsByReportId.get(row.id) ?? 0
  }));
}

export async function verifyModerationReport(id: string) {
  const client = ensureSupabase();
  const { error } = await client
    .from("blood_reports")
    .update({ verification_status: "verified", moderation_notes: "Verified by admin dashboard" })
    .eq("id", id);

  if (error) {
    throw new ApiError(500, "Failed to verify report.", error.message);
  }

  return { id, status: "verified" as const };
}

export async function rejectModerationReport(id: string) {
  const client = ensureSupabase();
  const { error } = await client
    .from("blood_reports")
    .update({ verification_status: "rejected", moderation_notes: "Rejected by admin dashboard" })
    .eq("id", id);

  if (error) {
    throw new ApiError(500, "Failed to reject report.", error.message);
  }

  return { id, status: "rejected" as const };
}

export async function listVerifiedSources(includeInactive: boolean) {
  const client = ensureSupabase();
  let query = client
    .from("verified_sources")
    .select("id, name, source_type, address, latitude, longitude, contact_number, is_active, badge_label")
    .order("created_at", { ascending: false });

  if (!includeInactive) {
    query = query.eq("is_active", true);
  }

  const { data, error } = await query;

  if (error) {
    throw new ApiError(500, "Failed to load verified sources.", error.message);
  }

  return (data ?? []).map((row) => mapVerifiedSource(row as VerifiedSourceRow));
}

export async function createVerifiedSource(input: {
  name: string;
  sourceType: VerifiedSource["sourceType"];
  address: string;
  latitude: number;
  longitude: number;
  contactNumber?: string;
  badgeLabel: string;
  isActive: boolean;
}) {
  const client = ensureSupabase();
  const { data, error } = await client
    .from("verified_sources")
    .insert({
      name: input.name,
      source_type: input.sourceType,
      address: input.address,
      latitude: input.latitude,
      longitude: input.longitude,
      contact_number: input.contactNumber ?? null,
      badge_label: input.badgeLabel,
      is_active: input.isActive
    })
    .select("id, name, source_type, address, latitude, longitude, contact_number, is_active, badge_label")
    .single();

  if (error) {
    throw new ApiError(500, "Failed to create verified source.", error.message);
  }

  return mapVerifiedSource(data as VerifiedSourceRow);
}

export async function updateVerifiedSource(
  id: string,
  input: Partial<{
    name: string;
    sourceType: VerifiedSource["sourceType"];
    address: string;
    latitude: number;
    longitude: number;
    contactNumber?: string;
    badgeLabel: string;
    isActive: boolean;
  }>
) {
  const client = ensureSupabase();
  const updatePayload = {
    name: input.name,
    source_type: input.sourceType,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    contact_number: input.contactNumber ?? undefined,
    badge_label: input.badgeLabel,
    is_active: input.isActive
  };

  const { data, error } = await client
    .from("verified_sources")
    .update(updatePayload)
    .eq("id", id)
    .select("id, name, source_type, address, latitude, longitude, contact_number, is_active, badge_label")
    .single();

  if (error) {
    throw new ApiError(500, "Failed to update verified source.", error.message);
  }

  return mapVerifiedSource(data as VerifiedSourceRow);
}
