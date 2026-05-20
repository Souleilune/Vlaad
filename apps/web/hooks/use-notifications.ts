"use client";

import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { NotificationItem } from "@vlaad/shared";
import { apiUrl } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import { createBrowserSupabaseClient } from "@/lib/supabase/client";

async function fetchNotifications(): Promise<NotificationItem[]> {
  const token = getStoredToken();

  if (!token) {
    return [];
  }

  const response = await fetch(apiUrl("/notifications"), {
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as { items?: NotificationItem[]; message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Failed to load notifications.");
  }

  return payload.items ?? [];
}

async function markRead(id: string) {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Authentication required.");
  }

  const response = await fetch(apiUrl(`/notifications/${id}/read`), {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`
    }
  });

  const payload = (await response.json()) as { item?: NotificationItem; message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Failed to mark notification as read.");
  }

  return payload.item;
}

export function useNotifications() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: ["notifications"],
    queryFn: fetchNotifications,
    staleTime: 30_000
  });

  const markReadMutation = useMutation({
    mutationFn: markRead,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
    }
  });

  useEffect(() => {
    const client = createBrowserSupabaseClient();

    if (!client) {
      return;
    }

    const channel = client
      .channel("notifications-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "notifications" },
        () => {
          void queryClient.invalidateQueries({ queryKey: ["notifications"] });
        }
      )
      .subscribe();

    return () => {
      void client.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    notifications: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refresh: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    markRead: markReadMutation.mutate,
    isMarkingRead: markReadMutation.isPending
  };
}
