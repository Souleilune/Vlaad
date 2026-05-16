"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, CircleHelp, MapPinned, Radar, Siren } from "lucide-react";
import { BLOOD_TYPES, type ReportIntent } from "@vlaad/shared";
import { useRealtimeFeed } from "@/hooks/use-realtime-feed";
import { useAppStore } from "@/store/use-app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ReportDetailsModal } from "@/components/reports/report-details-modal";

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

type MapShellProps = {
  layout?: "split" | "stacked";
};

type ReportVisibilityFilter = "all" | "request" | "availability";
const PUBLIC_MAP_TUTORIAL_KEY = "vlaad-public-map-tutorial-seen";

export function MapShell({ layout = "split" }: MapShellProps) {
  const { reports, loading } = useRealtimeFeed();
  const { selectedBloodTypes, toggleBloodType, urgentOnly, setUrgentOnly } = useAppStore();
  const [focusedReportId, setFocusedReportId] = useState<string | undefined>(undefined);
  const [openReportId, setOpenReportId] = useState<string | undefined>(undefined);
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const [reportVisibility, setReportVisibility] = useState<ReportVisibilityFilter>("all");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const isStacked = layout === "stacked";

  useEffect(() => {
    if (!isStacked || typeof window === "undefined") {
      return;
    }

    const hasSeenTutorial = window.localStorage.getItem(PUBLIC_MAP_TUTORIAL_KEY);
    if (!hasSeenTutorial) {
      setTutorialOpen(true);
    }
  }, [isStacked]);

  const matchesReportVisibility = (intent: ReportIntent) => {
    if (reportVisibility === "all") {
      return true;
    }

    if (reportVisibility === "request") {
      return intent === "request";
    }

    return intent === "donor_offer" || intent === "inventory_offer";
  };

  const filtered = useMemo(
    () =>
      reports.filter((report) => {
        if (!selectedBloodTypes.includes(report.bloodType)) {
          return false;
        }

        if (!matchesReportVisibility(report.intent)) {
          return false;
        }

        if (urgentOnly && !report.isEmergency) {
          return false;
        }

        return true;
      }),
    [reports, reportVisibility, selectedBloodTypes, urgentOnly]
  );

  const focusedReport = filtered.find((report) => report.id === focusedReportId) ?? filtered[0];
  const openReport = filtered.find((report) => report.id === openReportId);

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

  const closeTutorial = () => {
    setTutorialOpen(false);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(PUBLIC_MAP_TUTORIAL_KEY, "true");
    }
  };

  const openTutorial = () => setTutorialOpen(true);
  const mapControlButtonClass = "border border-slate-200/90";

  return (
    <>
      <ReportDetailsModal
        report={openReport}
        open={Boolean(openReport)}
        onClose={() => setOpenReportId(undefined)}
      />
      <div className={`grid gap-6 ${isStacked ? "" : "xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]"}`}>
        <Card className="overflow-hidden p-0">
          <div className={`relative ${isStacked ? "min-h-[36rem] sm:min-h-[42rem]" : "min-h-[70vh]"}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-pixelSky/30 via-cream/10 to-mint/30" />
            {isStacked ? (
              <div className="absolute right-4 top-16 z-[600] sm:right-5 sm:top-20">
                <Button variant="secondary" size="sm" onClick={openTutorial}>
                  <CircleHelp className="mr-2 h-4 w-4" />
                  Guide
                </Button>
              </div>
            ) : null}
            <div className="absolute left-4 top-16 z-[600] max-w-[calc(100%-2rem)] sm:left-5 sm:top-20">
              <div className="rounded-[24px] border border-white/50 bg-white/82 p-3 shadow-glass backdrop-blur-xl">
                <button
                  type="button"
                  className="flex items-center gap-3 text-left"
                  onClick={() => setControlsExpanded((current) => !current)}
                  aria-expanded={controlsExpanded}
                  aria-label={controlsExpanded ? "Collapse map controls" : "Expand map controls"}
                >
                  <span className="rounded-full bg-softCoral/10 p-2 text-softCoral">
                    <Radar className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Map Controls</p>
                    <p className="text-sm font-semibold text-slate-900">
                      {filtered.length} live reports
                    </p>
                  </div>
                  <span className={`ml-1 text-slate-500 transition-transform ${controlsExpanded ? "rotate-180" : ""}`}>
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                {controlsExpanded ? (
                  <div className="mt-4 border-t border-white/50 pt-4">
                    <div className="grid gap-2 text-sm text-slate-500 sm:grid-cols-3">
                      <div className="rounded-2xl bg-white/70 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Visible reports</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{filtered.length}</p>
                      </div>
                      <div className="rounded-2xl bg-white/70 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Emergency posts</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">
                          {filtered.filter((report) => report.isEmergency).length}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-white/70 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Blood types</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">{selectedBloodTypes.length}</p>
                      </div>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        variant={reportVisibility === "all" ? "default" : "secondary"}
                        size="sm"
                        className={mapControlButtonClass}
                        onClick={() => setReportVisibility("all")}
                      >
                        All reports
                      </Button>
                      <Button
                        variant={reportVisibility === "request" ? "default" : "secondary"}
                        size="sm"
                        className={mapControlButtonClass}
                        onClick={() => setReportVisibility("request")}
                      >
                        Requests
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className={
                          reportVisibility === "availability"
                            ? "border border-sky-700/70 bg-sky-700 text-white hover:bg-sky-800"
                            : mapControlButtonClass
                        }
                        onClick={() => setReportVisibility("availability")}
                      >
                        Availability
                      </Button>
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className={mapControlButtonClass}
                        onClick={() => {
                          BLOOD_TYPES.forEach((type) => {
                            if (selectedBloodTypes.includes(type)) {
                              toggleBloodType(type);
                            }
                          });
                        }}
                      >
                        Clear
                      </Button>
                      {BLOOD_TYPES.map((type) => (
                        <Button
                          key={type}
                          variant={selectedBloodTypes.includes(type) ? "default" : "secondary"}
                          size="sm"
                          className={mapControlButtonClass}
                          onClick={() => toggleBloodType(type)}
                        >
                          {type}
                        </Button>
                      ))}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button variant="pixel" size="sm" className={mapControlButtonClass}>
                        <Radar className="mr-2 h-4 w-4" />
                        Hotspots
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className={mapControlButtonClass}
                        onClick={openDirections}
                        disabled={!focusedReport}
                      >
                        <MapPinned className="mr-2 h-4 w-4" />
                        Directions
                      </Button>
                      <Button
                        variant={urgentOnly ? "default" : "secondary"}
                        size="sm"
                        className={mapControlButtonClass}
                        onClick={() => setUrgentOnly(!urgentOnly)}
                      >
                        <Siren className="mr-2 h-4 w-4" />
                        Emergency Only
                      </Button>
                    </div>
                  </div>
                ) : null}
              </div>
            </div>

            {tutorialOpen && isStacked ? (
              <div className="absolute inset-0 z-[650] flex items-center justify-center bg-slate-900/28 p-4 sm:p-6">
                <div className="w-full max-w-2xl rounded-[32px] border border-white/80 bg-[#fffdf8] p-6 shadow-[0_24px_70px_rgba(15,23,42,0.22)] sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">How Vlaad Works</p>
                      <h3 className="mt-2 text-3xl font-semibold text-slate-900">Start with the map, then filter, then act.</h3>
                    </div>
                    <Button variant="ghost" size="sm" onClick={closeTutorial}>
                      Skip
                    </Button>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-[24px] bg-softCoral/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-softCoral">Step 1</p>
                      <h4 className="mt-2 text-lg font-semibold text-slate-900">Explore reports</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Scan the markers first. Every marker represents a live request or an availability post.
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-pixelSky/18 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-sky-700">Step 2</p>
                      <h4 className="mt-2 text-lg font-semibold text-slate-900">Narrow the feed</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Open map controls to switch between requests, availability, blood types, and emergency-only posts.
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-retroYellow/30 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-700">Step 3</p>
                      <h4 className="mt-2 text-lg font-semibold text-slate-900">Open details or post</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        Tap a marker or report card for details, then create a new report when you want to contribute.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      You can reopen this anytime with the <span className="font-semibold text-slate-700">Guide</span> button on the map.
                    </p>
                    <Button variant="pixel" onClick={closeTutorial}>
                      Got it
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            <LiveMap reports={filtered} focusedReportId={focusedReport?.id} onFocusReport={setFocusedReportId} />
          </div>
        </Card>

        <div className="space-y-4">
          <Card className={isStacked ? "p-6" : "bg-slate-900/95 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.2)]"}>
            <p className={`text-xs font-semibold uppercase tracking-[0.24em] ${isStacked ? "text-slate-400" : "text-white/60"}`}>
              Community Feed
            </p>
            <h3 className={`mt-2 text-2xl font-semibold ${isStacked ? "text-slate-900" : "text-white"}`}>
              Open a report and inspect what is happening on the ground.
            </h3>
            <p className={`mt-2 text-sm leading-6 ${isStacked ? "text-slate-600" : "text-white/70"}`}>
              {isStacked
                ? "After the map catches attention, this section gives the full context for each request, donor offer, and blood bag update."
                : "This feed stays alongside the map so responders can compare geography and report details without leaving the homepage."}
            </p>
          </Card>

          {loading ? (
            <Card>
              <p className="font-semibold text-slate-900">Loading live reports...</p>
              <p className="mt-2 text-sm text-slate-500">
                Pulling the latest requests and availability posts from your configured backend.
              </p>
            </Card>
          ) : null}

          <div className={isStacked ? "grid gap-4 lg:grid-cols-2 2xl:grid-cols-3" : "space-y-4"}>
            {filtered.map((report) => (
              <Card
                key={report.id}
                className={`transition duration-200 hover:-translate-y-0.5 ${
                  report.id === focusedReport?.id ? "ring-2 ring-softCoral/50" : ""
                }`}
              >
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    setFocusedReportId(report.id);
                    setOpenReportId(report.id);
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-sm text-slate-500">
                        {report.organizationName ??
                          (report.intent === "request" ? "Blood request" : "Availability post")}
                      </p>
                      <h3 className="mt-1 text-lg font-semibold text-slate-900">{report.title}</h3>
                    </div>
                    <Badge
                      className={
                        report.intent === "request"
                          ? "bg-softCoral text-white"
                          : "bg-pixelSky/45 text-slate-800"
                      }
                    >
                      {report.intent === "request"
                        ? report.isEmergency
                          ? "Urgent request"
                          : "Request"
                        : report.intent === "inventory_offer"
                          ? "Bags available"
                          : "Donor available"}
                    </Badge>
                  </div>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                    Tap for full details
                  </p>
                  <p className="mt-3 text-sm text-slate-600">{report.description}</p>
                  <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
                    <span>{report.availableBags} bags available</span>
                    <span>Expires {new Date(report.expiresAt).toLocaleTimeString()}</span>
                  </div>
                </button>
              </Card>
            ))}
          </div>

          {filtered.length === 0 ? (
            <Card>
              <p className="font-semibold text-slate-900">No live reports found.</p>
              <p className="mt-2 text-sm text-slate-500">
                Submit a new request or availability post, or connect Supabase to start seeing realtime updates here.
              </p>
            </Card>
          ) : null}
        </div>
      </div>
    </>
  );
}
