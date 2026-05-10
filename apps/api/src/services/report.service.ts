import { randomUUID } from "node:crypto";
import type { BloodReport } from "@vlaad/shared";
import { supabaseAdmin } from "../lib/supabase";
import { ApiError } from "../utils/api-error";

function mapRowToReport(row: Record<string, unknown>): BloodReport {
  return {
    id: String(row.id),
    title: String(row.title),
    bloodType: row.blood_type as BloodReport["bloodType"],
    organizationName: (row.organization_name as string | null | undefined) ?? null,
    description: String(row.description),
    address: String(row.address),
    location: {
      lat: Number(row.latitude),
      lng: Number(row.longitude)
    },
    contactNumber: (row.contact_number as string | null | undefined) ?? null,
    imageUrls: [],
    expiresAt: String(row.expires_at),
    availableBags: Number(row.available_bags),
    verificationStatus: row.verification_status as BloodReport["verificationStatus"],
    sourceType: row.source_type as BloodReport["sourceType"],
    isEmergency: Boolean(row.is_emergency),
    createdAt: String(row.created_at)
  };
}

export async function listReports() {
  if (!supabaseAdmin) {
    return [];
  }

  const { data, error } = await supabaseAdmin
    .from("blood_reports")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new ApiError(500, "Failed to load blood reports", error.message);
  }

  return (data ?? []).map((row) => mapRowToReport(row));
}

export async function getReportById(id: string) {
  if (!supabaseAdmin) {
    return null;
  }

  const { data, error } = await supabaseAdmin.from("blood_reports").select("*").eq("id", id).maybeSingle();

  if (error) {
    throw new ApiError(500, "Failed to load blood report", error.message);
  }

  return data ? mapRowToReport(data) : null;
}

export async function createReport(input: {
  title: string;
  bloodType: string;
  organizationName?: string;
  description: string;
  address: string;
  latitude: number;
  longitude: number;
  contactNumber?: string;
  expiresAt: string;
  availableBags: number;
  sourceType: "community" | "trusted_contributor" | "verified_source";
  isEmergency: boolean;
  nickname?: string;
}) {
  const verificationStatus = input.sourceType === "verified_source" ? "verified" : "pending";

  if (!supabaseAdmin) {
    throw new ApiError(503, "Supabase is not configured for report submissions yet.");
  }

  const insertPayload = {
    id: randomUUID(),
    title: input.title,
    blood_type: input.bloodType,
    organization_name: input.organizationName ?? null,
    description: input.description,
    address: input.address,
    latitude: input.latitude,
    longitude: input.longitude,
    contact_number: input.contactNumber ?? null,
    expires_at: input.expiresAt,
    available_bags: input.availableBags,
    source_type: input.sourceType,
    verification_status: verificationStatus,
    is_emergency: input.isEmergency,
    nickname: input.nickname ?? null
  };

  const { data, error } = await supabaseAdmin
    .from("blood_reports")
    .insert(insertPayload)
    .select("*")
    .single();

  if (error) {
    throw new ApiError(500, "Failed to save blood report", error.message);
  }

  return mapRowToReport(data);
}
