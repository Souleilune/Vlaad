"use client";

import { CalendarClock, Droplets, MapPinned, Phone, UserRound, X } from "lucide-react";
import type { BloodReport } from "@vlaad/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ReportDetailsModalProps = {
  report?: BloodReport;
  open: boolean;
  onClose: () => void;
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

export function ReportDetailsModal({ report, open, onClose }: ReportDetailsModalProps) {
  if (!open || !report) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <Card className="scrollbar-hidden relative z-[1001] max-h-[90vh] w-full max-w-2xl overflow-y-auto border-[#f3e7dc] bg-[#fffaf4] p-6 shadow-[0_28px_80px_rgba(15,23,42,0.28)] sm:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <Badge
              className={
                report.intent === "request"
                  ? "bg-softCoral text-white"
                  : "bg-pixelSky/45 text-slate-800"
              }
            >
              {getIntentLabel(report)}
            </Badge>
            <h2 className="mt-4 text-3xl font-semibold text-slate-900">{report.title}</h2>
            <p className="mt-2 text-sm text-slate-500">
              {report.organizationName ?? (report.intent === "request" ? "Community request" : "Availability post")}
            </p>
          </div>
          <Button variant="secondary" size="icon" aria-label="Close report details" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <div className="rounded-[22px] border border-[#efe3d8] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Blood type</p>
            <p className="mt-2 font-display text-2xl text-slate-900">{report.bloodType}</p>
          </div>
          <div className="rounded-[22px] border border-[#efe3d8] bg-white p-4">
            <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
              {report.intent === "request" ? "Needed / available" : "Available count"}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">{report.availableBags}</p>
          </div>
        </div>

        <div className="mt-6 rounded-[24px] border border-[#efe3d8] bg-white p-5">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Details</p>
          <p className="mt-3 text-base leading-7 text-slate-700">{report.description}</p>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex items-start gap-3 rounded-[22px] border border-[#efe3d8] bg-white p-4">
            <MapPinned className="mt-0.5 h-5 w-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900">Address</p>
              <p className="mt-1 text-sm text-slate-600">{report.address}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-[22px] border border-[#efe3d8] bg-white p-4">
            <CalendarClock className="mt-0.5 h-5 w-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900">Expires</p>
              <p className="mt-1 text-sm text-slate-600">{new Date(report.expiresAt).toLocaleString()}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-[22px] border border-[#efe3d8] bg-white p-4">
            <Droplets className="mt-0.5 h-5 w-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900">Verification</p>
              <p className="mt-1 text-sm capitalize text-slate-600">{report.verificationStatus.replaceAll("_", " ")}</p>
            </div>
          </div>
          {report.contactNumber ? (
            <div className="flex items-start gap-3 rounded-[22px] border border-[#efe3d8] bg-white p-4">
              <Phone className="mt-0.5 h-5 w-5 text-slate-500" />
              <div>
                <p className="font-medium text-slate-900">Contact</p>
                <p className="mt-1 text-sm text-slate-600">{report.contactNumber}</p>
              </div>
            </div>
          ) : null}
          {report.nickname ? (
            <div className="flex items-start gap-3 rounded-[22px] border border-[#efe3d8] bg-white p-4">
              <UserRound className="mt-0.5 h-5 w-5 text-slate-500" />
              <div>
                <p className="font-medium text-slate-900">Nickname</p>
                <p className="mt-1 text-sm text-slate-600">{report.nickname}</p>
              </div>
            </div>
          ) : null}
          <div className="flex items-start gap-3 rounded-[22px] border border-[#efe3d8] bg-white p-4">
            <UserRound className="mt-0.5 h-5 w-5 text-slate-500" />
            <div>
              <p className="font-medium text-slate-900">Source</p>
              <p className="mt-1 text-sm capitalize text-slate-600">{report.sourceType.replaceAll("_", " ")}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a
            className="inline-flex h-11 items-center justify-center rounded-2xl border border-softCoral/80 bg-[#fff1ec] px-5 text-sm font-semibold text-slate-900 shadow-[4px_4px_0px_0px_rgba(251,113,133,0.42)] transition hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-[#ffe7e1] hover:shadow-none"
            href={`https://www.openstreetmap.org/?mlat=${report.location.lat}&mlon=${report.location.lng}#map=15/${report.location.lat}/${report.location.lng}`}
            rel="noreferrer"
            target="_blank"
          >
            Open in map
          </a>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  );
}
