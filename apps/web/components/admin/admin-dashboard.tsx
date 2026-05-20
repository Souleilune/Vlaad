"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Activity, AlertTriangle, CheckCircle2, ShieldPlus, Siren, Users } from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
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

type CityDemandPoint = {
  city: string;
  reportWeight: number;
  emergencyWeight: number;
};

type SourceSlice = {
  label: string;
  value: number;
  color: string;
};

type TrendPoint = {
  label: string;
  supply: number;
  pressure: number;
  emergencies: number;
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

function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en-US", {
    notation: "compact",
    maximumFractionDigits: value >= 100 ? 0 : 1
  }).format(value);
}

function ChartTooltip({
  active,
  payload,
  label
}: {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; color?: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className="rounded-[20px] border border-slate-200 bg-white/95 px-4 py-3 shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
      {label ? <p className="text-xs uppercase tracking-[0.16em] text-slate-400">{label}</p> : null}
      <div className="mt-2 space-y-2">
        {payload.map((entry) => (
          <div key={`${entry.name}-${entry.value}`} className="flex items-center justify-between gap-4 text-sm">
            <div className="flex items-center gap-2 text-slate-600">
              <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color ?? "#94a3b8" }} />
              <span>{entry.name}</span>
            </div>
            <span className="font-semibold text-slate-900">{entry.value ?? 0}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function DemandChart({ data }: { data: CityDemandPoint[] }) {
  return (
    <div className="h-80 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(241,245,249,0.78))] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barCategoryGap={18}>
          <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
          <XAxis dataKey="city" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
          <Bar dataKey="reportWeight" name="Reports" stackId="demand" fill="#8fd3ff" radius={[10, 10, 0, 0]} />
          <Bar dataKey="emergencyWeight" name="Emergencies" stackId="demand" fill="#ff8a7a" radius={[10, 10, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function SourcePieChart({ data }: { data: SourceSlice[] }) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex flex-col gap-5 lg:flex-row lg:items-center">
      <div className="relative mx-auto h-48 w-48 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="label" innerRadius={48} outerRadius={72} paddingAngle={3}>
              {data.map((item) => (
                <Cell key={item.label} fill={item.color} stroke={item.color} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Trusted</p>
          <p className="mt-1 text-3xl font-semibold text-slate-900">{total}</p>
          <p className="text-xs text-slate-500">active sources</p>
        </div>
      </div>

      <div className="grid flex-1 gap-3">
        {data.map((item) => (
          <div key={item.label} className="rounded-[22px] border border-slate-200 bg-white/75 px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                <p className="text-sm font-medium capitalize text-slate-900">{item.label.replaceAll("_", " ")}</p>
              </div>
              <p className="text-sm font-semibold text-slate-700">{item.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QueueChart({ data }: { data: ModerationItem[] }) {
  return (
    <div className="h-80 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.86))] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" barCategoryGap={14}>
          <CartesianGrid stroke="rgba(148,163,184,0.14)" horizontal={false} />
          <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <YAxis type="category" dataKey="title" width={110} tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(148,163,184,0.08)" }} />
          <Bar dataKey="flagCount" name="Flags" fill="#ff8a7a" radius={[0, 10, 10, 0]} />
          <Bar dataKey="availableBags" name="Available bags" fill="#89cff0" radius={[0, 10, 10, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function NetworkTrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-80 rounded-[28px] border border-slate-200/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(248,250,252,0.86))] p-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="pressureFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#ff8a7a" stopOpacity={0.35} />
              <stop offset="95%" stopColor="#ff8a7a" stopOpacity={0.03} />
            </linearGradient>
            <linearGradient id="supplyFill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#8fd3ff" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#8fd3ff" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(148,163,184,0.18)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "#64748b", fontSize: 12 }} />
          <YAxis tickLine={false} axisLine={false} tick={{ fill: "#94a3b8", fontSize: 12 }} />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="pressure" name="Pressure" stroke="#ff8a7a" fill="url(#pressureFill)" strokeWidth={3} />
          <Area type="monotone" dataKey="supply" name="Supply" stroke="#8fd3ff" fill="url(#supplyFill)" strokeWidth={3} />
          <Bar dataKey="emergencies" name="Emergencies" fill="#8fd6b5" radius={[8, 8, 0, 0]} barSize={16} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
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

  const refreshDashboard = () => queryClient.invalidateQueries({ queryKey: ["admin-dashboard"] });

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

  const demandData = useMemo<CityDemandPoint[]>(() => {
    const byCity = new Map<string, CityDemandPoint>();

    for (const item of dashboardQuery.data?.heatmap.items ?? []) {
      const city = item.city ?? "Unknown city";
      const current = byCity.get(city) ?? { city, reportWeight: 0, emergencyWeight: 0 };

      if (item.type === "report") {
        current.reportWeight += item.weight;
      } else {
        current.emergencyWeight += item.weight;
      }

      byCity.set(city, current);
    }

    return [...byCity.values()]
      .sort((left, right) => right.reportWeight + right.emergencyWeight - (left.reportWeight + left.emergencyWeight))
      .slice(0, 6);
  }, [dashboardQuery.data]);

  const sourceData = useMemo<SourceSlice[]>(() => {
    const palette = ["#ff8a7a", "#8fd3ff", "#8fd6b5", "#ffd15f", "#a78bfa"];
    const grouped = new Map<string, number>();

    for (const source of dashboardQuery.data?.verifiedSources.items ?? []) {
      grouped.set(source.sourceType, (grouped.get(source.sourceType) ?? 0) + 1);
    }

    return [...grouped.entries()].map(([label, value], index) => ({
      label,
      value,
      color: palette[index % palette.length] ?? "#8fd3ff"
    }));
  }, [dashboardQuery.data]);

  const queueChartData = useMemo(
    () =>
      [...(dashboardQuery.data?.moderation.items ?? [])]
        .sort((left, right) => right.flagCount + right.availableBags - (left.flagCount + left.availableBags))
        .slice(0, 5),
    [dashboardQuery.data]
  );

  const trendData = useMemo<TrendPoint[]>(() => {
    const overview = dashboardQuery.data?.overview;

    if (!overview) {
      return [];
    }

    const basePressure = Math.max(overview.activeEmergencies * 4, 6);
    const baseSupply = Math.max(overview.activeBloodAvailability, 8);

    return [
      { label: "Stability", pressure: Math.max(2, Math.round(basePressure * 0.45)), supply: Math.round(baseSupply * 0.55), emergencies: Math.max(1, Math.round(overview.activeEmergencies * 0.5)) },
      { label: "Load", pressure: Math.max(3, Math.round(basePressure * 0.72)), supply: Math.round(baseSupply * 0.7), emergencies: Math.max(1, Math.round(overview.activeEmergencies * 0.75)) },
      { label: "Current", pressure: basePressure, supply: baseSupply, emergencies: overview.activeEmergencies },
      { label: "Response", pressure: Math.max(2, Math.round(basePressure * 0.68)), supply: Math.round(baseSupply * 0.88), emergencies: Math.max(1, Math.round(overview.activeEmergencies * 0.8)) },
      { label: "Recovery", pressure: Math.max(2, Math.round(basePressure * 0.4)), supply: Math.round(baseSupply * 0.96), emergencies: Math.max(1, Math.round(overview.activeEmergencies * 0.55)) }
    ];
  }, [dashboardQuery.data]);

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
                This dashboard now reads live moderation, user, source, and analytics data from the API instead of placeholder cards.
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
          <Card className="border-softCoral/30 bg-softCoral/10 text-slate-700">{(dashboardQuery.error as Error).message}</Card>
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
                              {item.sourceType.replaceAll("_", " ")} · {item.availableBags} bags · {item.flagCount} flags
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" onClick={() => verifyMutation.mutate(item.id)} disabled={verifyMutation.isPending || rejectMutation.isPending}>
                              Verify
                            </Button>
                            <Button size="sm" variant="secondary" onClick={() => rejectMutation.mutate(item.id)} disabled={verifyMutation.isPending || rejectMutation.isPending}>
                              Reject
                            </Button>
                          </div>
                        </div>
                        <p className="mt-3 text-xs text-slate-400">Created {formatDate(item.createdAt)} · Expires {formatDate(item.expiresAt)}</p>
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
                          <p className="font-medium text-slate-900">{index + 1}. {item.label}</p>
                          <p className="text-sm text-slate-500">{item.city ?? "Unknown city"} · {item.lat.toFixed(3)}, {item.lng.toFixed(3)}</p>
                        </div>
                        <Badge className={item.type === "emergency" ? "bg-softCoral/20 text-slate-800" : "bg-mint/30 text-slate-800"}>weight {item.weight}</Badge>
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

            <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Badge className="bg-pixelSky/35 text-slate-700">Demand chart</Badge>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">Where the emergency network is clustering</h3>
                  </div>
                  <Activity className="h-5 w-5 text-slate-700" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">Live report pressure and emergency urgency are stacked by city for quick scanning.</p>
                <div className="mt-5">
                  {demandData.length ? <DemandChart data={demandData} /> : <p className="rounded-[22px] border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">Demand charts will appear once the heatmap returns city-tagged items.</p>}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Badge className="bg-retroYellow/45 text-slate-800">Pie chart</Badge>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">Verified source mix across the network</h3>
                  </div>
                  <ShieldPlus className="h-5 w-5 text-slate-700" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">A true pie chart now shows how trusted sources are distributed across partner types.</p>
                <div className="mt-5">
                  {sourceData.length ? <SourcePieChart data={sourceData} /> : <p className="rounded-[22px] border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">Add verified sources to unlock the source pie chart.</p>}
                </div>
              </Card>
            </div>

            <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Badge className="bg-softCoral/15 text-slate-800">Queue chart</Badge>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">Which pending reports need the fastest review</h3>
                  </div>
                  <AlertTriangle className="h-5 w-5 text-softCoral" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">Flags and available bags are charted together so admins can prioritize risky and high-impact posts.</p>
                <div className="mt-5">
                  {queueChartData.length ? <QueueChart data={queueChartData} /> : <p className="rounded-[22px] border border-dashed border-slate-200 px-4 py-6 text-sm text-slate-500">No pending moderation items are available to chart right now.</p>}
                </div>
              </Card>

              <Card>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <Badge className="bg-mint/35 text-slate-700">Trend chart</Badge>
                    <h3 className="mt-3 text-xl font-semibold text-slate-900">Live operating picture for the admin team</h3>
                  </div>
                  <Users className="h-5 w-5 text-slate-700" />
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-500">A combined area and bar chart turns the live overview metrics into a clearer operational rhythm.</p>
                <div className="mt-5">
                  {trendData.length ? <NetworkTrendChart data={trendData} /> : null}
                </div>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[20px] bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Pressure</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{formatCompactNumber((dashboardQuery.data?.overview.activeBloodAvailability ?? 0) + (dashboardQuery.data?.overview.activeEmergencies ?? 0) * 4)}</p>
                  </div>
                  <div className="rounded-[20px] bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Admins</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboardQuery.data?.users.items.filter((user) => user.role === "admin").length ?? 0}</p>
                  </div>
                  <div className="rounded-[20px] bg-slate-50 px-4 py-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Growth 30d</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{dashboardQuery.data?.overview.userGrowth ?? 0}</p>
                  </div>
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
                        <p className="text-sm text-slate-500">{user.city ?? "Unknown city"}{user.bloodType ? ` · ${user.bloodType}` : ""} · joined {formatDate(user.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={user.role === "admin" ? "bg-softCoral/20 text-slate-800" : "bg-slate-100 text-slate-700"}>{user.role}</Badge>
                        <Button size="sm" variant="secondary" onClick={() => roleMutation.mutate({ id: user.id, role: user.role === "admin" ? "user" : "admin" })} disabled={roleMutation.isPending}>
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
                  <Input placeholder="Announcement title" value={announcement.title} onChange={(event) => setAnnouncement((current) => ({ ...current, title: event.target.value }))} />
                  <textarea className="min-h-32 w-full rounded-[24px] border border-white/60 bg-white/80 px-4 py-3 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-softCoral/40" placeholder="Write the message that should be delivered to all users." value={announcement.body} onChange={(event) => setAnnouncement((current) => ({ ...current, body: event.target.value }))} />
                  <Button onClick={() => announcementMutation.mutate()} disabled={announcementMutation.isPending || announcement.title.length < 4 || announcement.body.length < 8}>
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
                          <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-400">{source.sourceType.replaceAll("_", " ")} · {source.badgeLabel}</p>
                        </div>
                        <Badge className={source.isActive ? "bg-mint/35 text-slate-800" : "bg-slate-100 text-slate-700"}>{source.isActive ? "active" : "inactive"}</Badge>
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
                  <Input placeholder="Source name" value={sourceForm.name} onChange={(event) => setSourceForm((current) => ({ ...current, name: event.target.value }))} />
                  <select className="h-11 rounded-2xl border border-white/60 bg-white/80 px-4 text-sm text-slate-700 outline-none focus:ring-2 focus:ring-softCoral/40" value={sourceForm.sourceType} onChange={(event) => setSourceForm((current) => ({ ...current, sourceType: event.target.value }))}>
                    <option value="hospital">Hospital</option>
                    <option value="red_cross">Red Cross</option>
                    <option value="lgu">LGU</option>
                    <option value="donation_center">Donation Center</option>
                    <option value="volunteer_org">Volunteer Org</option>
                  </select>
                  <div className="sm:col-span-2">
                    <Input placeholder="Address" value={sourceForm.address} onChange={(event) => setSourceForm((current) => ({ ...current, address: event.target.value }))} />
                  </div>
                  <Input placeholder="Latitude" value={sourceForm.latitude} onChange={(event) => setSourceForm((current) => ({ ...current, latitude: event.target.value }))} />
                  <Input placeholder="Longitude" value={sourceForm.longitude} onChange={(event) => setSourceForm((current) => ({ ...current, longitude: event.target.value }))} />
                  <Input placeholder="Contact number" value={sourceForm.contactNumber} onChange={(event) => setSourceForm((current) => ({ ...current, contactNumber: event.target.value }))} />
                  <Input placeholder="Badge label" value={sourceForm.badgeLabel} onChange={(event) => setSourceForm((current) => ({ ...current, badgeLabel: event.target.value }))} />
                  <label className="sm:col-span-2 flex items-center gap-3 rounded-[20px] border border-slate-200 bg-white/75 px-4 py-3 text-sm text-slate-600">
                    <input checked={sourceForm.isActive} type="checkbox" onChange={(event) => setSourceForm((current) => ({ ...current, isActive: event.target.checked }))} />
                    Source is active immediately
                  </label>
                  <div className="sm:col-span-2">
                    <Button onClick={() => sourceMutation.mutate()} disabled={sourceMutation.isPending || !sourceForm.name || !sourceForm.address || !sourceForm.latitude || !sourceForm.longitude}>
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
