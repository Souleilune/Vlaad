"use client";

import { useQuery } from "@tanstack/react-query";
import type { PublicAnnouncement } from "@vlaad/shared";
import { apiUrl } from "@/lib/api";

async function fetchPublicAnnouncements(): Promise<PublicAnnouncement[]> {
  const response = await fetch(apiUrl("/announcements/public"), {
    cache: "no-store"
  });

  const payload = (await response.json()) as { items?: PublicAnnouncement[]; message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Failed to load public announcements.");
  }

  return payload.items ?? [];
}

export function usePublicAnnouncements() {
  const query = useQuery({
    queryKey: ["public-announcements"],
    queryFn: fetchPublicAnnouncements,
    staleTime: 60_000
  });

  return {
    announcements: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error
  };
}
