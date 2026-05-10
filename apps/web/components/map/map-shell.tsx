"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";
import { MapPinned, Radar, Siren } from "lucide-react";
import { BLOOD_TYPES } from "@vlaad/shared";
import { useRealtimeFeed } from "@/hooks/use-realtime-feed";
import { useAppStore } from "@/store/use-app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const LiveMap = dynamic(
  () => import("@/components/map/live-map").then((module) => module.LiveMap),
  {
    ssr: false,
    loading: () => (
      <div className="relative min-h-[560px] bg-[length:26px_26px] bg-grid-fade">
        <div className="absolute inset-0 bg-gradient-to-br from-pixelSky/30 via-cream/10 to-mint/30" />
        <div className="relative flex h-full min-h-[560px] items-center justify-center">
          <div className="rounded-[28px] border border-white/50 bg-white/80 px-6 py-4 text-sm text-slate-600 shadow-glass backdrop-blur-xl">
            Loading OpenStreetMap layer...
          </div>
        </div>
      </div>
    )
  }
);

export function MapShell() {
  const { reports, loading } = useRealtimeFeed();
  const { selectedBloodTypes, toggleBloodType, urgentOnly, setUrgentOnly } = useAppStore();
  const [focusedReportId, setFocusedReportId] = useState<string | undefined>(undefined);

  const filtered = useMemo(
    () =>
      reports.filter((report) => {
        if (!selectedBloodTypes.includes(report.bloodType)) {
          return false;
        }

        if (urgentOnly && !report.isEmergency) {
          return false;
        }

        return true;
      }),
    [reports, selectedBloodTypes, urgentOnly]
  );

  const focusedReport = filtered.find((report) => report.id === focusedReportId) ?? filtered[0];

  const openDirections = () => {
    if (!focusedReport) {
      return;
    }

    window.open(
      `https://www.openstreetmap.org/?mlat=${focusedReport.location.lat}&mlon=${focusedReport.location.lng}#map=15/${focusedReport.location.lat}/${focusedReport.location.lng}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
      <Card className="overflow-hidden p-0">
        <div className="relative min-h-[560px]">
          <div className="absolute inset-0 bg-gradient-to-br from-pixelSky/30 via-cream/10 to-mint/30" />
          <div className="absolute left-4 top-4 z-[600] max-w-[calc(100%-2rem)]">
            <div className="rounded-[24px] border border-white/50 bg-white/82 p-4 shadow-glass backdrop-blur-xl">
              <div className="mb-3 flex flex-wrap gap-2">
                {BLOOD_TYPES.map((type) => (
                  <Button
                    key={type}
                    variant={selectedBloodTypes.includes(type) ? "default" : "secondary"}
                    size="sm"
                    onClick={() => toggleBloodType(type)}
                  >
                    {type}
                  </Button>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="pixel" size="sm">
                  <Radar className="mr-2 h-4 w-4" />
                  Hotspots
                </Button>
                <Button variant="secondary" size="sm" onClick={openDirections} disabled={!focusedReport}>
                  <MapPinned className="mr-2 h-4 w-4" />
                  Directions
                </Button>
                <Button
                  variant={urgentOnly ? "default" : "secondary"}
                  size="sm"
                  onClick={() => setUrgentOnly(!urgentOnly)}
                >
                  <Siren className="mr-2 h-4 w-4" />
                  Emergency Only
                </Button>
              </div>
            </div>
          </div>

          <LiveMap reports={filtered} focusedReportId={focusedReport?.id} onFocusReport={setFocusedReportId} />
        </div>
      </Card>

      <div className="space-y-4">
        {loading ? (
          <Card>
            <p className="font-semibold text-slate-900">Loading live reports...</p>
            <p className="mt-2 text-sm text-slate-500">Pulling the latest incident feed from your configured backend.</p>
          </Card>
        ) : null}

        {filtered.map((report) => (
          <Card
            key={report.id}
            className={report.id === focusedReport?.id ? "ring-2 ring-softCoral/50" : ""}
          >
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setFocusedReportId(report.id)}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm text-slate-500">{report.organizationName ?? "Community report"}</p>
                  <h3 className="mt-1 text-lg font-semibold text-slate-900">{report.title}</h3>
                </div>
                <Badge className={report.isEmergency ? "bg-softCoral text-white" : "bg-pixelSky/40"}>
                  {report.isEmergency ? "Emergency" : "Active"}
                </Badge>
              </div>
              <p className="mt-3 text-sm text-slate-600">{report.description}</p>
              <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                <span>{report.availableBags} bags available</span>
                <span>Expires {new Date(report.expiresAt).toLocaleTimeString()}</span>
              </div>
            </button>
          </Card>
        ))}

        {filtered.length === 0 ? (
          <Card>
            <p className="font-semibold text-slate-900">No live reports found.</p>
            <p className="mt-2 text-sm text-slate-500">
              Submit a new incident report or connect Supabase to start seeing realtime updates here.
            </p>
          </Card>
        ) : null}
      </div>
    </div>
  );
}
