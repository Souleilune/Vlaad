"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useState } from "react";
import { ChevronDown, CircleHelp, ClipboardPlus, MapPinned, Radar, Siren } from "lucide-react";
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
        <div className="absolute inset-0 bg-gradient-to-br from-softCoral/12 via-cleanWhite/20 to-softGold/10" />
        <div className="relative flex h-full min-h-[560px] items-center justify-center">
          <div
            className="h-12 w-12 rounded-full border-4 border-cleanWhite/60 border-t-softCoral bg-cleanWhite/40 shadow-glass backdrop-blur-xl"
            aria-label="Loading map"
            role="status"
          />
        </div>
      </div>
    )
  }
);

type MapShellProps = {
  layout?: "split" | "stacked";
  onCreateReport?: () => void;
};

type ReportVisibilityFilter = "all" | "request" | "availability";
type ControlTab = "summary" | "blood" | "actions";
const PUBLIC_MAP_TUTORIAL_KEY = "agos-bd-public-map-tutorial-seen";

function formatReportExpiry(value: string) {
  const date = new Date(value);

  return {
    time: date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }),
    date: date.toLocaleDateString([], { month: "short", day: "numeric" })
  };
}

export function MapShell({ layout = "split", onCreateReport }: MapShellProps) {
  const { reports, loading } = useRealtimeFeed();
  const { selectedBloodTypes, toggleBloodType, urgentOnly, setUrgentOnly } = useAppStore();
  const [focusedReportId, setFocusedReportId] = useState<string | undefined>(undefined);
  const [openReportId, setOpenReportId] = useState<string | undefined>(undefined);
  const [routeReportId, setRouteReportId] = useState<string | undefined>(undefined);
  const [controlsExpanded, setControlsExpanded] = useState(false);
  const [reportVisibility, setReportVisibility] = useState<ReportVisibilityFilter>("all");
  const [activeControlTab, setActiveControlTab] = useState<ControlTab>("summary");
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [reportListExpanded, setReportListExpanded] = useState(false);
  const [isMapExpanded, setIsMapExpanded] = useState(false);
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

  useEffect(() => {
    if (!isMapExpanded || typeof document === "undefined") {
      return;
    }

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isMapExpanded]);

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
  const routeReport = filtered.find((report) => report.id === routeReportId);
  const stackedVisibleReports = reportListExpanded ? filtered : filtered.slice(0, 6);
  const featuredStackedReport = stackedVisibleReports[0];
  const secondaryStackedReports = stackedVisibleReports.slice(1);

  const handleRequestDirections = (reportId: string) => {
    setFocusedReportId(reportId);
    setRouteReportId(reportId);
  };

  const closeTutorial = () => {
    setTutorialOpen(false);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(PUBLIC_MAP_TUTORIAL_KEY, "true");
    }
  };

  const openTutorial = () => setTutorialOpen(true);
  const mapControlButtonClass = "rounded-2xl border border-softCoral/18 shadow-none hover:shadow-none";
  const controlTabButtonClass = "h-9 rounded-2xl border border-softCoral/18 px-3 text-xs font-semibold uppercase tracking-[0.16em] shadow-none hover:shadow-none";

  return (
    <>
      <ReportDetailsModal
        report={openReport}
        open={Boolean(openReport)}
        onClose={() => setOpenReportId(undefined)}
        onRequestDirections={(reportId) => {
          handleRequestDirections(reportId);
          setOpenReportId(undefined);
        }}
      />
      <div
        className={
          isMapExpanded
            ? "fixed inset-0 z-[900] grid gap-0 bg-cleanWhite lg:grid-cols-[minmax(0,1fr)_minmax(360px,400px)]"
            : `grid gap-6 ${isStacked ? "" : "xl:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.55fr)]"}`
        }
      >
        <Card className={isMapExpanded ? "overflow-hidden rounded-none border-0 p-0 shadow-none" : "overflow-hidden p-0"}>
          <div className={`relative ${isMapExpanded ? "h-screen min-h-screen" : isStacked ? "min-h-[36rem] sm:min-h-[42rem]" : "min-h-[70vh]"}`}>
            <div className="absolute inset-0 bg-gradient-to-br from-softCoral/12 via-cleanWhite/18 to-softGold/10" />
            {isStacked && !isMapExpanded ? (
              <div className="absolute right-4 top-[7.5rem] z-[600]">
                <Button
                  variant="secondary"
                  size="icon"
                  className="h-11 w-11 rounded-2xl shadow-none hover:shadow-none"
                  onClick={openTutorial}
                  aria-label="Open map guide"
                  title="Guide"
                >
                  <CircleHelp className="h-4 w-4" />
                </Button>
              </div>
            ) : null}
            <div className={`absolute bottom-[3.9rem] left-4 z-[600] w-[19rem] max-w-[calc(100%-2rem)] sm:bottom-[3.9rem] sm:left-5 ${isMapExpanded ? "hidden" : ""}`}>
              <div
                className={`border border-white/50 bg-white/82 shadow-glass backdrop-blur-xl transition-all ${
                  controlsExpanded ? "w-full rounded-2xl p-3" : "w-full rounded-2xl px-4 py-3"
                }`}
              >
                <button
                  type="button"
                  className={`flex w-full items-center justify-between text-left ${controlsExpanded ? "gap-3" : "gap-2"}`}
                  onClick={() => setControlsExpanded((current) => !current)}
                  aria-expanded={controlsExpanded}
                  aria-label={controlsExpanded ? "Collapse map controls" : "Expand map controls"}
                >
                  <div className="flex items-center gap-3">
                  <span className="rounded-2xl bg-softCoral/10 p-2 text-softCoral">
                      <Radar className="h-4 w-4" />
                    </span>
                    <div>
                    {controlsExpanded ? (
                      <>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-deepCrimson/42">Map Controls</p>
                        <p className="text-sm font-semibold text-deepCrimson">
                          {filtered.length} live reports
                        </p>
                      </>
                      ) : (
                      <p className="text-sm font-semibold text-deepCrimson">{filtered.length} reports</p>
                    )}
                    </div>
                  </div>
                  <span className={`ml-1 text-deepCrimson/56 transition-transform ${controlsExpanded ? "rotate-180" : ""}`}>
                    <ChevronDown className="h-4 w-4" />
                  </span>
                </button>

                {controlsExpanded ? (
                  <div className="mt-4 border-t border-white/50 pt-4">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={activeControlTab === "summary" ? "default" : "secondary"}
                        size="sm"
                        className={controlTabButtonClass}
                        onClick={() => setActiveControlTab("summary")}
                      >
                        Filters
                      </Button>
                      <Button
                        variant={activeControlTab === "blood" ? "default" : "secondary"}
                        size="sm"
                        className={controlTabButtonClass}
                        onClick={() => setActiveControlTab("blood")}
                      >
                        Blood Types
                      </Button>
                      <Button
                        variant={activeControlTab === "actions" ? "default" : "secondary"}
                        size="sm"
                        className={controlTabButtonClass}
                        onClick={() => setActiveControlTab("actions")}
                      >
                        Actions
                      </Button>
                    </div>

                    <div className="mt-4 hidden gap-2 text-sm text-deepCrimson/56 md:grid md:grid-cols-2">
                      <div className="rounded-2xl bg-cleanWhite/72 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-deepCrimson/42">Visible reports</p>
                        <p className="mt-1 text-2xl font-semibold text-deepCrimson">{filtered.length}</p>
                      </div>
                      <div className="rounded-2xl bg-cleanWhite/72 px-4 py-3">
                        <p className="text-xs uppercase tracking-[0.2em] text-deepCrimson/42">Emergency posts</p>
                        <p className="mt-1 text-2xl font-semibold text-deepCrimson">
                          {filtered.filter((report) => report.isEmergency).length}
                        </p>
                      </div>
                      <div className="rounded-2xl bg-cleanWhite/72 px-4 py-3 md:col-span-2">
                        <p className="text-xs uppercase tracking-[0.2em] text-deepCrimson/42">Blood types</p>
                        <p className="mt-1 text-2xl font-semibold text-deepCrimson">{selectedBloodTypes.length}</p>
                      </div>
                    </div>

                    {activeControlTab === "summary" ? (
                      <div className="mt-4 space-y-3">
                        <div className="flex flex-wrap gap-2">
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
                                ? "border border-softGold/50 bg-softGold text-deepCrimson hover:bg-softGold/85"
                                : mapControlButtonClass
                            }
                            onClick={() => setReportVisibility("availability")}
                          >
                            Availability
                          </Button>
                        </div>

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
                    ) : null}

                    {activeControlTab === "blood" ? (
                      <div className="mt-4 space-y-3">
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
                          Clear all
                        </Button>
                        <div className="grid grid-cols-4 gap-2">
                          {BLOOD_TYPES.map((type) => (
                            <Button
                              key={type}
                              variant={selectedBloodTypes.includes(type) ? "default" : "secondary"}
                              size="sm"
                              className="border border-softCoral/18 px-0"
                              onClick={() => toggleBloodType(type)}
                            >
                              {type}
                            </Button>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {activeControlTab === "actions" ? (
                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          className={mapControlButtonClass}
                          onClick={() => {
                            if (focusedReport) {
                              handleRequestDirections(focusedReport.id);
                            }
                          }}
                          disabled={!focusedReport}
                        >
                          <MapPinned className="mr-2 h-4 w-4" />
                          Directions
                        </Button>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </div>
            </div>

            {tutorialOpen && isStacked ? (
              <div className="absolute inset-0 z-[650] flex items-center justify-center bg-deepCrimson/18 p-4 sm:p-6">
                <div className="w-full max-w-2xl rounded-2xl border border-softCoral/18 bg-[#fffdf8] p-6 shadow-[0_24px_70px_rgba(139,0,0,0.16)] sm:p-8">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.24em] text-deepCrimson/42">How AGOS-BD Works</p>
                      <h3 className="mt-2 text-3xl font-semibold text-deepCrimson">Start on the map. Open the reports. Post only after you confirm the need.</h3>
                      <p className="mt-3 max-w-xl text-sm leading-6 text-deepCrimson/72">
                        The homepage is built for quick verification. Scan the map first, open a report for full details, then use the report button inside the map when you have a real update to share.
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" className="shadow-none hover:shadow-none" onClick={closeTutorial}>
                      Skip
                    </Button>
                  </div>

                  <div className="mt-6 grid gap-4 md:grid-cols-3">
                    <div className="rounded-2xl bg-softCoral/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-softCoral">Step 1</p>
                      <h4 className="mt-2 text-lg font-semibold text-deepCrimson">Scan the map</h4>
                      <p className="mt-2 text-sm leading-6 text-deepCrimson/72">
                        Start with the markers. They show where requests, donor offers, and blood bag availability are happening right now.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-softGold/16 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-softGold">Step 2</p>
                      <h4 className="mt-2 text-lg font-semibold text-deepCrimson">Open full details</h4>
                      <p className="mt-2 text-sm leading-6 text-deepCrimson/72">
                        Tap a marker or report card to inspect the location, blood type, urgency, contact details, and expiration time before acting.
                      </p>
                    </div>
                    <div className="rounded-2xl bg-softGold/24 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-deepCrimson">Step 3</p>
                      <h4 className="mt-2 text-lg font-semibold text-deepCrimson">Create a report</h4>
                      <p className="mt-2 text-sm leading-6 text-deepCrimson/72">
                        Use the Create a report button inside the map when you want to add the next verified request or availability update.
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Reopen this anytime with the <span className="font-semibold text-slate-700">Guide</span> button in the top-right corner of the map.
                    </p>
                    <Button variant="pixel" className="shadow-none hover:shadow-none" onClick={closeTutorial}>
                      Got it
                    </Button>
                  </div>
                </div>
              </div>
            ) : null}

            <LiveMap
              reports={filtered}
              focusedReportId={focusedReport?.id}
              routedReportId={routeReport?.id}
              isExpanded={isMapExpanded}
              onOpenReport={(reportId) => {
                setFocusedReportId(reportId);
                setOpenReportId(reportId);
              }}
              onRequestDirections={handleRequestDirections}
              onClearDirections={() => setRouteReportId(undefined)}
              onToggleExpanded={() => setIsMapExpanded((current) => !current)}
            />

            {isStacked && onCreateReport && !isMapExpanded ? (
              <div className="absolute bottom-4 left-4 z-[600] w-[11rem] max-w-[calc(100%-2rem)] sm:bottom-5 sm:left-5">
                <Button
                  variant="default"
                  size="sm"
                  className="w-full rounded-2xl shadow-none hover:shadow-none"
                  onClick={onCreateReport}
                >
                  <ClipboardPlus className="mr-2 h-4 w-4" />
                  Create a report
                </Button>
              </div>
            ) : null}
          </div>
        </Card>

        <div className={isMapExpanded ? "hidden h-screen space-y-4 overflow-y-auto border-l border-slate-200 bg-[#fffdf8] p-5 shadow-[-18px_0_45px_rgba(15,23,42,0.12)] lg:block" : "space-y-4"}>
          {isMapExpanded ? (
            <Card className="border-slate-200/80 bg-white/92 p-5 shadow-[0_18px_40px_rgba(148,163,184,0.14)]">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-softCoral">Map Helpers</p>
                  <h3 className="mt-2 text-2xl font-semibold text-slate-900">Community Reports</h3>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-3 gap-2">
                <Button
                  variant={reportVisibility === "all" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-2xl px-2 shadow-none hover:shadow-none"
                  onClick={() => setReportVisibility("all")}
                >
                  All
                </Button>
                <Button
                  variant={reportVisibility === "request" ? "default" : "secondary"}
                  size="sm"
                  className="rounded-2xl px-2 shadow-none hover:shadow-none"
                  onClick={() => setReportVisibility("request")}
                >
                  Need
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  className={
                    reportVisibility === "availability"
                      ? "rounded-2xl border border-softGold/50 bg-softGold px-2 text-deepCrimson shadow-none hover:bg-softGold/85 hover:shadow-none"
                      : "rounded-2xl px-2 shadow-none hover:shadow-none"
                  }
                  onClick={() => setReportVisibility("availability")}
                >
                  Supply
                </Button>
              </div>

              <Button
                variant={urgentOnly ? "default" : "secondary"}
                size="sm"
                className="mt-3 w-full rounded-2xl shadow-none hover:shadow-none"
                onClick={() => setUrgentOnly(!urgentOnly)}
              >
                <Siren className="mr-2 h-4 w-4" />
                Emergency only
              </Button>

              <div className="mt-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Blood Types</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 rounded-2xl px-3 text-xs shadow-none hover:shadow-none"
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
                </div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {BLOOD_TYPES.map((type) => (
                    <Button
                      key={type}
                      variant={selectedBloodTypes.includes(type) ? "default" : "secondary"}
                      size="sm"
                      className="rounded-2xl border border-softCoral/18 px-0 shadow-none hover:shadow-none"
                      onClick={() => toggleBloodType(type)}
                    >
                      {type}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-2">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Urgent</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{filtered.filter((report) => report.isEmergency).length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Types</p>
                  <p className="mt-1 text-2xl font-semibold text-slate-900">{selectedBloodTypes.length}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-2xl shadow-none hover:shadow-none"
                  onClick={() => {
                    if (focusedReport) {
                      handleRequestDirections(focusedReport.id);
                    }
                  }}
                  disabled={!focusedReport}
                >
                  <MapPinned className="mr-2 h-4 w-4" />
                  Directions
                </Button>
                {onCreateReport ? (
                  <Button variant="default" size="sm" className="rounded-2xl shadow-none hover:shadow-none" onClick={onCreateReport}>
                    <ClipboardPlus className="mr-2 h-4 w-4" />
                    Report
                  </Button>
                ) : null}
              </div>
            </Card>
          ) : isStacked ? (
            <div className="px-1 pt-1">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
                Community reports
              </p>
            </div>
          ) : (
            <Card className="bg-slate-900/95 p-5 text-white shadow-[0_20px_50px_rgba(15,23,42,0.2)]">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                Community reports
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-white">
                Open a report and inspect what is happening on the ground.
              </h3>
              <p className="mt-2 text-sm leading-6 text-white/70">
                This feed stays alongside the map so responders can compare geography and report details without leaving the homepage.
              </p>
            </Card>
          )}

          {loading ? (
            <Card>
              <p className="font-semibold text-slate-900">Loading live reports...</p>
              <p className="mt-2 text-sm text-slate-500">
                Pulling the latest requests and availability posts from your configured backend.
              </p>
            </Card>
          ) : null}

          {filtered.length > 0 ? (
            <div className={isStacked ? "space-y-4" : ""}>
              {!isStacked ? (
                <Card className="overflow-hidden border-slate-200/80 bg-white/88 p-0 shadow-[0_20px_50px_rgba(148,163,184,0.18)] backdrop-blur-xl">
                  <div className="border-b border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,244,238,0.95),rgba(241,248,255,0.9))] px-5 py-4">
                    <div className="flex items-end justify-between gap-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Live queue</p>
                        <h3 className="mt-1 text-xl font-semibold text-slate-900">
                          {filtered.length} active {filtered.length === 1 ? "report" : "reports"}
                        </h3>
                      </div>
                      <div className="flex gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        <span className="rounded-full bg-white/80 px-3 py-2">
                          {filtered.filter((report) => report.isEmergency).length} urgent
                        </span>
                        <span className="rounded-full bg-white/80 px-3 py-2">
                          {filtered.filter((report) => report.intent === "request").length} requests
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="max-h-[calc(70vh-10rem)] overflow-y-auto p-4">
                    <div className="space-y-3">
                      {filtered.map((report, index) => {
                        const expiry = formatReportExpiry(report.expiresAt);
                        const isFocused = report.id === focusedReport?.id;

                        return (
                          <button
                            key={report.id}
                            type="button"
                            className={`group relative w-full overflow-hidden rounded-[26px] border px-4 py-4 text-left transition duration-200 ${
                              isFocused
                                ? "border-softCoral/60 bg-[#fff7f2] shadow-[0_18px_40px_rgba(251,113,133,0.16)]"
                                : "border-slate-200/80 bg-white hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_14px_34px_rgba(148,163,184,0.18)]"
                            }`}
                            onClick={() => {
                              setFocusedReportId(report.id);
                              setOpenReportId(report.id);
                            }}
                          >
                            <div className="flex items-start gap-4">
                              <div
                                className={`mt-0.5 flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-2xl border text-sm font-semibold ${
                                  report.intent === "request"
                                    ? "border-softCoral/20 bg-softCoral/10 text-softCoral"
                                    : "border-sky-200 bg-pixelSky/35 text-sky-800"
                                }`}
                              >
                                <span className="text-[10px] uppercase tracking-[0.14em] text-current/70">Type</span>
                                <span>{report.bloodType}</span>
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                      {report.organizationName ??
                                        (report.intent === "request" ? "Blood request" : "Availability post")}
                                    </p>
                                    <h3 className="mt-1 line-clamp-2 text-base font-semibold text-slate-900">
                                      {report.title}
                                    </h3>
                                  </div>
                                  <Badge
                                    className={
                                      report.intent === "request"
                                        ? "shrink-0 bg-softCoral text-white"
                                        : "shrink-0 bg-pixelSky/45 text-slate-800"
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

                                <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{report.description}</p>

                                <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-medium text-slate-500">
                                  <span className="rounded-full bg-slate-100 px-3 py-1.5">
                                    #{String(index + 1).padStart(2, "0")}
                                  </span>
                                  <span className="rounded-full bg-slate-100 px-3 py-1.5">
                                    {report.availableBags} bags available
                                  </span>
                                  <span className="rounded-full bg-slate-100 px-3 py-1.5">
                                    Expires {expiry.time}
                                  </span>
                                  <span className="rounded-full bg-slate-100 px-3 py-1.5">{expiry.date}</span>
                                </div>
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </Card>
              ) : (
                <div className="space-y-4">
                  <Card className="border-white/60 bg-white/82 p-4 shadow-[0_18px_40px_rgba(148,163,184,0.14)] backdrop-blur-xl">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">Incident queue</p>
                        <h3 className="mt-1 text-lg font-semibold text-slate-900">
                          {filtered.length} live {filtered.length === 1 ? "incident" : "incidents"}
                        </h3>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                        <span className="rounded-full bg-slate-100 px-3 py-2">
                          {filtered.filter((report) => report.isEmergency).length} urgent
                        </span>
                        <span className="rounded-full bg-slate-100 px-3 py-2">
                          {selectedBloodTypes.length} blood types
                        </span>
                      </div>
                    </div>

                    {filtered.length > 6 ? (
                      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-200/70 pt-4">
                        <p className="text-sm text-slate-500">
                          Showing {stackedVisibleReports.length} of {filtered.length} incidents.
                        </p>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="rounded-2xl shadow-none hover:shadow-none"
                          onClick={() => setReportListExpanded((current) => !current)}
                        >
                          {reportListExpanded ? "Show less" : "Show all incidents"}
                        </Button>
                      </div>
                    ) : null}
                  </Card>

                  {featuredStackedReport ? (
                    (() => {
                      const expiry = formatReportExpiry(featuredStackedReport.expiresAt);

                      return (
                        <Card
                          className={`overflow-hidden border p-0 transition duration-200 ${
                            featuredStackedReport.id === focusedReport?.id
                              ? "border-softCoral/50 shadow-[0_18px_40px_rgba(251,113,133,0.16)]"
                              : "border-white/60 shadow-[0_18px_40px_rgba(148,163,184,0.14)]"
                          }`}
                        >
                          <button
                            type="button"
                            className="w-full bg-[linear-gradient(135deg,rgba(255,247,242,0.98),rgba(244,248,255,0.92))] p-5 text-left"
                            onClick={() => {
                              setFocusedReportId(featuredStackedReport.id);
                              setOpenReportId(featuredStackedReport.id);
                            }}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                  {featuredStackedReport.organizationName ??
                                    (featuredStackedReport.intent === "request" ? "Blood request" : "Availability post")}
                                </p>
                                <h3 className="mt-2 text-xl font-semibold leading-tight text-slate-900">
                                  {featuredStackedReport.title}
                                </h3>
                              </div>
                              <div className="flex shrink-0 flex-col items-end gap-2">
                                <Badge
                                  className={
                                    featuredStackedReport.intent === "request"
                                      ? "bg-softCoral text-white"
                                      : "bg-pixelSky/45 text-slate-800"
                                  }
                                >
                                  {featuredStackedReport.intent === "request"
                                    ? featuredStackedReport.isEmergency
                                      ? "Urgent request"
                                      : "Request"
                                    : featuredStackedReport.intent === "inventory_offer"
                                      ? "Bags available"
                                      : "Donor available"}
                                </Badge>
                                <span className="rounded-full bg-white/80 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                                  {featuredStackedReport.bloodType}
                                </span>
                              </div>
                            </div>

                            <p className="mt-4 line-clamp-3 text-sm leading-6 text-slate-600">
                              {featuredStackedReport.description}
                            </p>

                            <div className="mt-5 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                              <span className="rounded-full bg-white/80 px-3 py-1.5">
                                {featuredStackedReport.availableBags} bags available
                              </span>
                              <span className="rounded-full bg-white/80 px-3 py-1.5">
                                Expires {expiry.time}
                              </span>
                              <span className="rounded-full bg-white/80 px-3 py-1.5">{expiry.date}</span>
                            </div>
                          </button>
                        </Card>
                      );
                    })()
                  ) : null}

                  {secondaryStackedReports.length > 0 ? (
                    <div className="grid gap-4 lg:grid-cols-2">
                      {secondaryStackedReports.map((report, index) => {
                        const expiry = formatReportExpiry(report.expiresAt);

                        return (
                          <Card
                            key={report.id}
                            className={`overflow-hidden border p-0 transition duration-200 hover:-translate-y-0.5 ${
                              report.id === focusedReport?.id
                                ? "border-softCoral/50 shadow-[0_18px_40px_rgba(251,113,133,0.16)]"
                                : "border-white/60 shadow-[0_14px_30px_rgba(148,163,184,0.12)]"
                            }`}
                          >
                            <button
                              type="button"
                              className="w-full p-4 text-left"
                              onClick={() => {
                                setFocusedReportId(report.id);
                                setOpenReportId(report.id);
                              }}
                            >
                              <div className="flex items-start gap-3">
                                <div
                                  className={`mt-0.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border text-sm font-semibold ${
                                    report.intent === "request"
                                      ? "border-softCoral/20 bg-softCoral/10 text-softCoral"
                                      : "border-sky-200 bg-pixelSky/35 text-sky-800"
                                  }`}
                                >
                                  {report.bloodType}
                                </div>

                                <div className="min-w-0 flex-1">
                                  <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                                        {report.organizationName ??
                                          (report.intent === "request" ? "Blood request" : "Availability post")}
                                      </p>
                                      <h3 className="mt-1 line-clamp-2 text-base font-semibold text-slate-900">
                                        {report.title}
                                      </h3>
                                    </div>
                                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                                      #{String(index + 2).padStart(2, "0")}
                                    </span>
                                  </div>

                                  <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{report.description}</p>

                                  <div className="mt-4 flex flex-wrap gap-2 text-xs font-medium text-slate-500">
                                    <span className="rounded-full bg-slate-100 px-3 py-1.5">
                                      {report.availableBags} bags
                                    </span>
                                    <span className="rounded-full bg-slate-100 px-3 py-1.5">
                                      {expiry.time}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </button>
                          </Card>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          ) : null}

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
