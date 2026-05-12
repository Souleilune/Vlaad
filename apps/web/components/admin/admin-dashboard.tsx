"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, ShieldPlus, Siren, Users } from "lucide-react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { apiUrl } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";

type AnalyticsOverview = {
  totalReports: number;
  activeBloodAvailability: number;
  activeEmergencies: number;
  resolvedRequests: number;
  userGrowth: number;
  verificationRate: number;
};

type HeatmapItem = {
  id: string;
  label: string;
  city: string | null;
  lat: number;
  lng: number;
  type: "report" | "emergency";
  weight: number;
};

type ModerationItem = {
  id: string;
  title: string;
  bloodType: string;
  sourceType: string;
  verificationStatus: string;
  address: string;
  availableBags: number;
  createdAt: string;
  expiresAt: string;
  organizationName?: string | null;
  nickname?: string | null;
  isEmergency: boolean;
  flagCount: number;
};

type AdminUser = {
  id: string;
  role: "user" | "admin";
  fullName: string;
  bloodType: string | null;
  city: string | null;
  createdAt: string | null;
};

type VerifiedSource = {
  id: string;
  name: string;
  sourceType: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  contactNumber?: string | null;
  isActive: boolean;
  badgeLabel: string;
};

type DashboardPayload = {
  overview: AnalyticsOverview;
  heatmap: { items: HeatmapItem[] };
  moderation: { items: ModerationItem[] };
  users: { items: AdminUser[] };
  verifiedSources: { items: VerifiedSource[] };
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

async function fetchAdminDashboard(): Promise<DashboardPayload> {
  const [overview, heatmap, moderation, users, verifiedSources] = await Promise.all([
    fetchJson<AnalyticsOverview>("/analytics/overview"),
    fetchJson<{ items: HeatmapItem[] }>("/analytics/heatmap"),
    fetchJson<{ items: ModerationItem[] }>("/moderation/queue"),
    fetchJson<{ items: AdminUser[] }>("/admin/users"),
    fetchJson<{ items: VerifiedSource[] }>("/verified-sources")
  ]);

  return { overview, heatmap, moderation, users, verifiedSources };
}

function formatDate(value: string | null) {
  if (!value) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export function AdminDashboard() {
  const queryClient = useQueryClient();
  const [announcement, setAnnouncement] = useState({ title: "", body: "" });
  const [sourceForm, setSourceForm] = useState({
    name: "",
    sourceType: "hospital",
    address: "",
    latitude: "",
    longitude: "",
    contactNumber: "",
    badgeLabel: "Verified Source",
    isActive: true
  });

  const dashboardQuery = useQuery({
    queryKey: ["admin-dashboard"],
    queryFn: fetchAdminDashboard
  });

  const refreshDashboard = () =>
    queryClient.invalidateQueries({
      queryKey: ["admin-dashboard"]
    });

  const verifyMutation = useMutation({
    mutationFn: (id: string) => fetchJson(`/moderation/reports/${id}/verify`, { method: "POST" }),
    onSuccess: refreshDashboard
  });

  const rejectMutation = useMutation({
    mutationFn: (id: string) => fetchJson(`/moderation/reports/${id}/reject`, { method: "POST" }),
    onSuccess: refreshDashboard
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: "user" | "admin" }) =>
      fetchJson(`/admin/users/${id}/role`, {
        method: "PATCH",
        body: JSON.stringify({ role })
      }),
    onSuccess: refreshDashboard
  });

  const announcementMutation = useMutation({
    mutationFn: () =>
      fetchJson("/admin/announcements", {
        method: "POST",
        body: JSON.stringify(announcement)
      }),
    onSuccess: () => {
      setAnnouncement({ title: "", body: "" });
      refreshDashboard();
    }
  });

  const sourceMutation = useMutation({
    mutationFn: () =>
      fetchJson("/verified-sources", {
        method: "POST",
        body: JSON.stringify({
          ...sourceForm,
          latitude: Number(sourceForm.latitude),
          longitude: Number(sourceForm.longitude)
        })
      }),
    onSuccess: () => {
      setSourceForm({
        name: "",
        sourceType: "hospital",
        address: "",
        latitude: "",
        longitude: "",
        contactNumber: "",
        badgeLabel: "Verified Source",
        isActive: true
      });
      refreshDashboard();
    }
  });

  const metrics = useMemo(() => {
    const overview = dashboardQuery.data?.overview;

    if (!overview) {
      return [];
    }

    return [
      { label: "Total reports", value: String(overview.totalReports) },
      { label: "Active bags tracked", value: String(overview.activeBloodAvailability) },
      { label: "Open emergencies", value: String(overview.activeEmergencies) },
      { label: "Verification rate", value: `${overview.verificationRate}%`, trend: `${overview.userGrowth} new users / 30d` }
    ];
  }, [dashboardQuery.data]);

  const hotspots = useMemo(
    () => [...(dashboardQuery.data?.heatmap.items ?? [])].sort((a, b) => b.weight - a.weight).slice(0, 6),
    [dashboardQuery.data]
  );

  return (
    <AuthGuard loginRoute="/admin/login" requiredRole="admin" forbiddenRoute="/map">
      <div className="space-y-6">
        <Card className="relative overflow-hidden bg-slate-900 text-white">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(125,211,252,0.18),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(248,113,113,0.2),_transparent_24%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <Badge className="border-white/10 bg-white/10 text-white">Admin analytics</Badge>
              <h2 className="mt-4 text-3xl font-semibold">Moderate faster and watch the emergency network move in real time.</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/72">
                This dashboard now reads live moderation, user, source, and analytics data from the API instead of
                placeholder cards.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-white/78">
              <div className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-white/58">Resolved requests</p>
                <p className="mt-2 text-2xl font-semibold">{dashboardQuery.data?.overview.resolvedRequests ?? "--"}</p>
              </div>
              <div className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-3">
                <p className="text-white/58">Verified sources</p>
                <p className="mt-2 text-2xl font-semibold">{dashboardQuery.data?.verifiedSources.items.length ?? "--"}</p>
              </div>
            </div>
          </div>
        </Card>

        {dashboardQuery.isLoading ? (
          <Card>Loading admin dashboard...</Card>
        ) : dashboardQuery.isError ? (
          <Card className="border-softCoral/30 bg-softCoral/10 text-slate-700">
            {(dashboardQuery.error as Error).message}
          </Card>
        ) : (
          <>
            <StatsGrid metrics={metrics} />

            <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Badge className="bg-softCoral/15 text-slate-800">Moderation queue</Badge>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">Pending reports needing review</h3>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-softCoral" />
                </div>

                <div className="mt-5 space-y-4">
                  {dashboardQuery.data?.moderation.items.length ? (
                    dashboardQuery.data.moderation.items.map((item) => (
                      <div key={item.id} className="rounded-[24px] border border-slate-200 bg-white/75 p-4">
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-base font-semibold text-slate-900">{item.title}</p>
                              <Badge className="bg-retroYellow/40 text-slate-800">{item.bloodType}</Badge>
                              {item.isEmergency ? <Badge className="bg-softCoral/20 text-slate-800">Emergency</Badge> : null}
                            </div>
                            <p className="mt-2 text-sm text-slate-600">{item.address}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.18em] text-slate-400">
                              {item.sourceType.replaceAll("_", " ")} • {item.availableBags} bags • {item.flagCount} flags
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => verifyMutation.mutate(item.id)}
                              disabled={verifyMutation.isPending || rejectMutation.isPending}
                            >
                              Verify
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => rejectMutation.mutate(item.id)}
                              disabled={verifyMutation.isPending || rejectMutation.isPending}
                            >
                              Reject
                            </Button>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-400">
                          Created {formatDate(item.createdAt)} • Expires {formatDate(item.expiresAt)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-[22px] border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                      No pending reports are waiting in the moderation queue right now.
                    </p>
                  )}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Badge className="bg-pixelSky/35 text-slate-700">Demand hotspots</Badge>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">Highest-weight live coordinates</h3>
                  </div>
                  <Siren className="h-5 w-5 text-softCoral" />
                </div>

                <div className="mt-5 space-y-3">
                  {hotspots.length ? (
                    hotspots.map((item, index) => (
                      <div key={item.id} className="flex items-center justify-between rounded-[22px] border border-slate-200 px-4 py-3">
                        <div>
                          <p className="font-medium text-slate-900">
                            {index + 1}. {item.label}
                          </p>
                          <p className="text-sm text-slate-500">
                            {item.city ?? "Unknown city"} • {item.lat.toFixed(3)}, {item.lng.toFixed(3)}
                          </p>
                        </div>
                        <Badge className={item.type === "emergency" ? "bg-softCoral/20 text-slate-800" : "bg-mint/30 text-slate-800"}>
                          weight {item.weight}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="rounded-[22px] border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">
                      No active heatmap points were returned by the analytics API yet.
                    </p>
                  )}
                </div>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Badge className="bg-mint/35 text-slate-700">User roles</Badge>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">Promote or demote platform operators</h3>
                  </div>
                  <Users className="h-5 w-5 text-slate-700" />
                </div>

                <div className="mt-5 space-y-3">
                  {dashboardQuery.data?.users.items.map((user) => (
                    <div key={user.id} className="flex flex-col gap-3 rounded-[24px] border border-slate-200 bg-white/80 p-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{user.fullName}</p>
                        <p className="text-sm text-slate-500">
                          {user.city ?? "Unknown city"}{user.bloodType ? ` • ${user.bloodType}` : ""} • joined {formatDate(user.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={user.role === "admin" ? "bg-softCoral/20 text-slate-800" : "bg-slate-100 text-slate-700"}>
                          {user.role}
                        </Badge>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => roleMutation.mutate({ id: user.id, role: user.role === "admin" ? "user" : "admin" })}
                          disabled={roleMutation.isPending}
                        >
                          Set {user.role === "admin" ? "user" : "admin"}
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Badge className="bg-retroYellow/45 text-slate-800">Broadcast</Badge>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">Send a platform-wide announcement</h3>
                  </div>
                  <CheckCircle2 className="h-5 w-5 text-slate-700" />
                </div>

                <div className="mt-5 space-y-4">
                  <Input
                    placeholder="Announcement title"
                    value={announcement.title}
                    onChange={(event) => setAnnouncement((current) => ({ ...current, title: event.target.value }))}
                  />
                  <textarea
                    className="min-h-32 w-full rounded-[24px] border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-softCoral/40"
                    placeholder="Write the message that should be delivered to all users."
                    value={announcement.body}
                    onChange={(event) => setAnnouncement((current) => ({ ...current, body: event.target.value }))}
                  />
                  <Button
                    onClick={() => announcementMutation.mutate()}
                    disabled={announcementMutation.isPending || announcement.title.length < 4 || announcement.body.length < 8}
                  >
                    {announcementMutation.isPending ? "Sending..." : "Send announcement"}
                  </Button>
                </div>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Badge className="bg-pixelSky/35 text-slate-700">Verified sources</Badge>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">Trusted hospitals and donation centers</h3>
                  </div>
                  <ShieldPlus className="h-5 w-5 text-slate-700" />
                </div>

                <div className="mt-5 space-y-3">
                  {dashboardQuery.data?.verifiedSources.items.map((source) => (
                    <div key={source.id} className="rounded-[24px] border border-slate-200 bg-white/80 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{source.name}</p>
                          <p className="mt-1 text-sm text-slate-500">{source.address}</p>
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">
                            {source.sourceType.replaceAll("_", " ")} • {source.badgeLabel}
                          </p>
                        </div>
                        <Badge className={source.isActive ? "bg-mint/35 text-slate-800" : "bg-slate-100 text-slate-700"}>
                          {source.isActive ? "active" : "inactive"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Badge className="bg-softCoral/15 text-slate-800">Add source</Badge>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">Register a new trusted source</h3>
                  </div>
                  <ShieldPlus className="h-5 w-5 text-softCoral" />
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  <Input
                    placeholder="Source name"
                    value={sourceForm.name}
                    onChange={(event) => setSourceForm((current) => ({ ...current, name: event.target.value }))}
                  />
                  <select
                    className="h-11 rounded-2xl border border-white/60 bg-white/80 px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-softCoral/40"
                    value={sourceForm.sourceType}
                    onChange={(event) => setSourceForm((current) => ({ ...current, sourceType: event.target.value }))}
                  >
                    <option value="hospital">Hospital</option>
                    <option value="red_cross">Red Cross</option>
                    <option value="lgu">LGU</option>
                    <option value="donation_center">Donation Center</option>
                    <option value="volunteer_org">Volunteer Org</option>
                  </select>
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Address"
                      value={sourceForm.address}
                      onChange={(event) => setSourceForm((current) => ({ ...current, address: event.target.value }))}
                    />
                  </div>
                  <Input
                    placeholder="Latitude"
                    value={sourceForm.latitude}
                    onChange={(event) => setSourceForm((current) => ({ ...current, latitude: event.target.value }))}
                  />
                  <Input
                    placeholder="Longitude"
                    value={sourceForm.longitude}
                    onChange={(event) => setSourceForm((current) => ({ ...current, longitude: event.target.value }))}
                  />
                  <Input
                    placeholder="Contact number"
                    value={sourceForm.contactNumber}
                    onChange={(event) => setSourceForm((current) => ({ ...current, contactNumber: event.target.value }))}
                  />
                  <Input
                    placeholder="Badge label"
                    value={sourceForm.badgeLabel}
                    onChange={(event) => setSourceForm((current) => ({ ...current, badgeLabel: event.target.value }))}
                  />
                  <label className="sm:col-span-2 flex items-center gap-3 rounded-[20px] border border-slate-200 bg-white/75 px-4 py-3 text-sm text-slate-600">
                    <input
                      checked={sourceForm.isActive}
                      type="checkbox"
                      onChange={(event) => setSourceForm((current) => ({ ...current, isActive: event.target.checked }))}
                    />
                    Source is active immediately
                  </label>
                  <div className="sm:col-span-2">
                    <Button
                      onClick={() => sourceMutation.mutate()}
                      disabled={
                        sourceMutation.isPending ||
                        !sourceForm.name ||
                        !sourceForm.address ||
                        !sourceForm.latitude ||
                        !sourceForm.longitude
                      }
                    >
                      {sourceMutation.isPending ? "Creating..." : "Create verified source"}
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </AuthGuard>
  );
}
