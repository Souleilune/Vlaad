"use client";

import { useEffect, useState } from "react";
import type { BloodReport } from "@vlaad/shared";
import { apiUrl } from "@/lib/api";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

function hasValidCoordinates(value: unknown): value is { lat: number; lng: number } {
  if (!value || typeof value !== "object") {
    return false;
  }

  const maybeLocation = value as { lat?: unknown; lng?: unknown };
  return typeof maybeLocation.lat === "number" && typeof maybeLocation.lng === "number";
}

function normalizeReport(report: unknown): BloodReport | null {
  if (!report || typeof report !== "object") {
    return null;
  }

  const row = report as Record<string, unknown>;
  const rawLocation =
    hasValidCoordinates(row.location)
      ? row.location
      : typeof row.latitude === "number" && typeof row.longitude === "number"
        ? { lat: row.latitude, lng: row.longitude }
        : null;

  if (!rawLocation) {
    return null;
  }

  const sourceType = (row.sourceType ?? row.source_type ?? "community") as BloodReport["sourceType"];
  const intent =
    sourceType === "trusted_contributor"
      ? "donor_offer"
      : sourceType === "verified_source"
        ? "inventory_offer"
        : "request";

  return {
    id: String(row.id ?? ""),
    title: String(row.title ?? ""),
    bloodType: (row.bloodType ?? row.blood_type ?? "O+") as BloodReport["bloodType"],
    organizationName: (row.organizationName ?? row.organization_name ?? null) as string | null,
    description: String(row.description ?? ""),
    address: String(row.address ?? ""),
    location: rawLocation,
    contactNumber: (row.contactNumber ?? row.contact_number ?? null) as string | null,
    nickname: (row.nickname ?? null) as string | null,
    imageUrls: Array.isArray(row.imageUrls) ? (row.imageUrls as string[]) : [],
    expiresAt: String(row.expiresAt ?? row.expires_at ?? ""),
    availableBags: Number(row.availableBags ?? row.available_bags ?? 0),
    verificationStatus: (row.verificationStatus ?? row.verification_status ?? "pending") as BloodReport["verificationStatus"],
    sourceType,
    intent,
    isEmergency: Boolean(row.isEmergency ?? row.is_emergency),
    createdAt: String(row.createdAt ?? row.created_at ?? new Date().toISOString())
  } satisfies BloodReport;
}

export function useRealtimeFeed() {
  const [reports, setReports] = useState<BloodReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const client = createBrowserSupabaseClient();

    const loadReports = async () => {
      try {
        if (client) {
          const { data } = await client.from("blood_reports").select("*").order("created_at", { ascending: false });

          if (!mounted) {
            return;
          }

          if (data) {
            setReports(data.map(normalizeReport).filter((item): item is BloodReport => item !== null));
            return;
          }
        }

        const response = await fetch(apiUrl("/reports"), { cache: "no-store" });
        const payload = (await response.json()) as { items?: BloodReport[] };

        if (mounted) {
          setReports((payload.items ?? []).map(normalizeReport).filter((item): item is BloodReport => item !== null));
        }
      } catch {
        if (mounted) {
          setReports([]);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void loadReports();

    const handleManualRefresh = () => {
      void loadReports();
    };

    window.addEventListener("vlaad:reports-refresh", handleManualRefresh);

    if (!client) {
      return () => {
        mounted = false;
        window.removeEventListener("vlaad:reports-refresh", handleManualRefresh);
      };
    }

    const channel = client
      .channel("blood-reports")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "blood_reports" },
        () => {
          void loadReports();
        }
      )
      .subscribe();

    return () => {
      mounted = false;
      window.removeEventListener("vlaad:reports-refresh", handleManualRefresh);
      void client.removeChannel(channel);
    };
  }, []);

  return { reports, loading };
}
