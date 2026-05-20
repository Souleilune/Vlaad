"use client";

import { useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Archive, FileText, Trash2 } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { apiUrl } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";

type AdminAnnouncement = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  label: string;
  status: "active" | "archived" | "removed";
};

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const response = await fetch(apiUrl(path), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {})
    }
  });

  const payload = (await response.json()) as T & { message?: string };

  if (!response.ok) {
    throw new Error(payload.message ?? "Request failed.");
  }

  return payload;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

function statusBadge(status: AdminAnnouncement["status"]) {
  switch (status) {
    case "archived":
      return "bg-retroYellow/45 text-slate-800";
    case "removed":
      return "bg-slate-200 text-slate-700";
    default:
      return "bg-mint/35 text-slate-800";
  }
}

export function PatchNotesDashboard() {
  const queryClient = useQueryClient();
  const announcementsQuery = useQuery({
    queryKey: ["admin-announcements"],
    queryFn: () => fetchJson<{ items: AdminAnnouncement[] }>("/admin/announcements")
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["admin-announcements"] });

  const archiveMutation = useMutation({
    mutationFn: ({ id, archived }: { id: string; archived: boolean }) =>
      fetchJson(`/admin/announcements/${encodeURIComponent(id)}/archive`, {
        method: "PATCH",
        body: JSON.stringify({ archived })
      }),
    onSuccess: refresh
  });

  const removeMutation = useMutation({
    mutationFn: (id: string) =>
      fetchJson(`/admin/announcements/${encodeURIComponent(id)}`, {
        method: "DELETE"
      }),
    onSuccess: refresh
  });

  const stats = useMemo(() => {
    const items = announcementsQuery.data?.items ?? [];

    return {
      total: items.length,
      active: items.filter((item) => item.status === "active").length,
      archived: items.filter((item) => item.status === "archived").length,
      removed: items.filter((item) => item.status === "removed").length
    };
  }, [announcementsQuery.data]);

  return (
    <AuthGuard loginRoute="/admin/login" requiredRole="admin" forbiddenRoute="/map">
      <div className="space-y-6">
        <Card className="relative overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(250,204,21,0.18),_transparent_34%),radial-gradient(circle_at_bottom_right,_rgba(248,113,113,0.16),_transparent_28%)]" />
          <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="border-white/10 bg-white/10 text-white">Patch Notes</Badge>
              <h2 className="mt-4 text-3xl font-semibold">Organize what the public announcement banner and patch notes display.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
                Archive older release notes to pull them off the public surface, or remove items you no longer want visible in the history.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-white/78">
              <div className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-white/58">Active</p>
                <p className="mt-2 text-2xl font-semibold">{stats.active}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-white/58">Archived</p>
                <p className="mt-2 text-2xl font-semibold">{stats.archived}</p>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Total tracked</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.total}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Public now</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.active}</p>
          </Card>
          <Card>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Removed</p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">{stats.removed}</p>
          </Card>
        </div>

        {announcementsQuery.isLoading ? (
          <Card>Loading patch notes...</Card>
        ) : announcementsQuery.isError ? (
          <Card className="border-softCoral/30 bg-softCoral/10 text-slate-700">{(announcementsQuery.error as Error).message}</Card>
        ) : (
          <div className="grid gap-4">
            {announcementsQuery.data?.items.map((item) => (
              <Card key={item.id} className="rounded-[30px] border border-slate-200 bg-white/85 p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="max-w-3xl">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge className="bg-retroYellow/45 text-slate-800">{item.label}</Badge>
                      <Badge className={statusBadge(item.status)}>{item.status}</Badge>
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{formatDate(item.createdAt)}</p>
                    </div>
                    <div className="mt-4 flex items-start gap-3">
                      <FileText className="mt-1 h-5 w-5 shrink-0 text-softCoral" />
                      <div>
                        <h3 className="text-2xl font-semibold text-slate-900">{item.title}</h3>
                        <p className="mt-3 text-base leading-7 text-slate-600">{item.body}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 lg:justify-end">
                    {item.status !== "removed" ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => archiveMutation.mutate({ id: item.id, archived: item.status !== "archived" })}
                        disabled={archiveMutation.isPending || removeMutation.isPending}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        {item.status === "archived" ? "Restore" : "Archive"}
                      </Button>
                    ) : null}
                    {item.status !== "removed" ? (
                      <Button
                        size="sm"
                        onClick={() => removeMutation.mutate(item.id)}
                        disabled={archiveMutation.isPending || removeMutation.isPending}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Remove
                      </Button>
                    ) : null}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AuthGuard>
  );
}
