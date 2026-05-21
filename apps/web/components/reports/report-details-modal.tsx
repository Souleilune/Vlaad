"use client";

import { CalendarClock, Clock3, Droplets, MapPinned, Phone, ShieldCheck, UserRound, X } from "lucide-react";
import type { BloodReport } from "@vlaad/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ReportDetailsModalProps = {
  report?: BloodReport;
  open: boolean;
  onClose: () => void;
  onRequestDirections: (reportId: string) => void;
};

function getIntentLabel(report: BloodReport) {
  if (report.intent === "request") {
    return report.isEmergency ? "Urgent request" : "Request";
  }

  if (report.intent === "inventory_offer") {
    return "Blood bags available";
  }

  return "Donor / volunteer available";
}

function getReportTone(report: BloodReport) {
  if (report.intent === "request") {
    return report.isEmergency
      ? {
          badge: "bg-softCoral text-white",
          panel: "from-[#fff0ea] via-[#fff8f1] to-white",
          accent: "text-softCoral"
        }
      : {
          badge: "bg-[#ffeddc] text-[#9a3412]",
          panel: "from-[#fff7ee] via-[#fffaf5] to-white",
          accent: "text-[#c2410c]"
        };
  }

  return {
    badge: "bg-pixelSky/45 text-slate-800",
    panel: "from-[#eff8ff] via-[#f7fbff] to-white",
    accent: "text-sky-700"
  };
}

export function ReportDetailsModal({ report, open, onClose, onRequestDirections }: ReportDetailsModalProps) {
  if (!open || !report) {
    return null;
  }

  const tone = getReportTone(report);
  const expiresAt = new Date(report.expiresAt);

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <Card className="scrollbar-hidden relative z-[1001] max-h-[90vh] w-full max-w-4xl overflow-y-auto border-[#f3e7dc] bg-[#fffdf9] p-0 shadow-[0_28px_80px_rgba(15,23,42,0.28)]">
        <div className={`relative overflow-hidden rounded-t-[28px] bg-gradient-to-br ${tone.panel} px-6 pb-6 pt-6 sm:px-8`}>
          <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),transparent_65%)]" />
          <div className="relative flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={tone.badge}>{getIntentLabel(report)}</Badge>
                <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {report.bloodType}
                </span>
                <span className="rounded-full border border-white/80 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                  {report.availableBags} bags
                </span>
              </div>

              <h2 className="mt-4 text-3xl font-semibold leading-tight text-slate-900 sm:text-[2.2rem]">
                {report.title}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {report.organizationName ?? (report.intent === "request" ? "Community request" : "Availability post")}
              </p>
            </div>

            <Button
              variant="secondary"
              size="icon"
              className="shrink-0 bg-white/80"
              aria-label="Close report details"
              onClick={onClose}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="relative mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Blood type</p>
              <p className="mt-2 font-display text-3xl text-slate-900">{report.bloodType}</p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                {report.intent === "request" ? "Needed / available" : "Available count"}
              </p>
              <p className="mt-2 text-3xl font-semibold text-slate-900">{report.availableBags}</p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/75 p-4 shadow-[0_12px_30px_rgba(15,23,42,0.06)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Expiry</p>
              <p className="mt-2 text-lg font-semibold text-slate-900">{expiresAt.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}</p>
              <p className="mt-1 text-sm text-slate-500">{expiresAt.toLocaleDateString([], { month: "long", day: "numeric", year: "numeric" })}</p>
            </div>
          </div>
        </div>

        <div className="grid gap-6 px-6 py-6 sm:px-8 sm:py-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(18rem,0.8fr)]">
          <div className="space-y-6">
            <section className="rounded-[28px] border border-[#efe7dc] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)] sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Incident brief</p>
              <p className="mt-4 text-base leading-8 text-slate-700">{report.description}</p>
            </section>

            <section className="rounded-[28px] border border-[#efe7dc] bg-white p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)] sm:p-6">
              <div className="flex items-center gap-2">
                <MapPinned className={`h-5 w-5 ${tone.accent}`} />
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Location</p>
              </div>
              <p className="mt-4 text-base font-medium text-slate-900">{report.address}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">
                Use directions to compare this report against the live map before responding.
              </p>
            </section>
          </div>

          <div className="space-y-3">
            <div className="rounded-[28px] border border-[#efe7dc] bg-[#fffaf4] p-5 shadow-[0_16px_34px_rgba(15,23,42,0.05)]">
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Field details</p>

              <div className="mt-4 space-y-3">
                <div className="flex items-start gap-3 rounded-[22px] border border-white/80 bg-white px-4 py-3">
                  <CalendarClock className="mt-0.5 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">Expires</p>
                    <p className="mt-1 text-sm text-slate-600">{expiresAt.toLocaleString()}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-[22px] border border-white/80 bg-white px-4 py-3">
                  <ShieldCheck className="mt-0.5 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">Verification</p>
                    <p className="mt-1 text-sm capitalize text-slate-600">{report.verificationStatus.replaceAll("_", " ")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-[22px] border border-white/80 bg-white px-4 py-3">
                  <Clock3 className="mt-0.5 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">Source</p>
                    <p className="mt-1 text-sm capitalize text-slate-600">{report.sourceType.replaceAll("_", " ")}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-[22px] border border-white/80 bg-white px-4 py-3">
                  <Droplets className="mt-0.5 h-5 w-5 text-slate-500" />
                  <div>
                    <p className="font-medium text-slate-900">Category</p>
                    <p className="mt-1 text-sm text-slate-600">{getIntentLabel(report)}</p>
                  </div>
                </div>
              </div>
            </div>

            {report.contactNumber ? (
              <div className="flex items-start gap-3 rounded-[24px] border border-[#efe7dc] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                <Phone className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium text-slate-900">Contact</p>
                  <p className="mt-1 text-sm text-slate-600">{report.contactNumber}</p>
                </div>
              </div>
            ) : null}

            {report.nickname ? (
              <div className="flex items-start gap-3 rounded-[24px] border border-[#efe7dc] bg-white p-4 shadow-[0_12px_28px_rgba(15,23,42,0.05)]">
                <UserRound className="mt-0.5 h-5 w-5 text-slate-500" />
                <div>
                  <p className="font-medium text-slate-900">Nickname</p>
                  <p className="mt-1 text-sm text-slate-600">{report.nickname}</p>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        <div className="sticky bottom-0 border-t border-[#efe7dc] bg-white/92 px-6 py-4 backdrop-blur-xl sm:px-8">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Confirm the location and expiry before responding to this report.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                className="inline-flex h-11 items-center justify-center rounded-2xl border border-softCoral/70 bg-[#fff1ec] px-5 text-sm font-semibold text-slate-900 transition hover:bg-[#ffe7e1]"
                onClick={() => onRequestDirections(report.id)}
              >
                Get direction
              </button>
              <Button variant="secondary" onClick={onClose}>
                Close
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
