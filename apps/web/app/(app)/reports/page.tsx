"use client";

import { useMemo } from "react";
import type { BloodReport } from "@vlaad/shared";
import { useRealtimeFeed } from "@/hooks/use-realtime-feed";
import { ReportForm } from "@/components/reports/report-form";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function ReportsPage() {
  const { reports, loading } = useRealtimeFeed();

  const sortedReports = useMemo(
    () =>
      [...reports].sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime()
      ),
    [reports]
  );

  return (
    <div className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">
      <Card>
        <Badge className="mb-4 bg-pixelSky/35">Community Report Form</Badge>
        <ReportForm />
      </Card>

      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <Badge className="mb-3 bg-mint/30">Open Emergency Feed</Badge>
            <h2 className="text-2xl font-semibold text-slate-900">Active blood requests and availability posts</h2>
          </div>
          <Badge>{sortedReports.length} live</Badge>
        </div>

        <div className="space-y-4">
          {loading ? <p className="text-sm text-slate-500">Loading reports...</p> : null}
          {sortedReports.map((report: BloodReport) => (
            <div key={report.id} className="rounded-[24px] border border-white/50 bg-white/75 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-slate-900">{report.title}</h3>
                <Badge className={report.sourceType === "verified_source" ? "bg-mint/35" : "bg-white"}>
                  {report.sourceType.replaceAll("_", " ")}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-slate-500">{report.address}</p>
              <p className="mt-2 text-sm text-slate-600">{report.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{report.bloodType}</span>
                <span>{new Date(report.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {!loading && sortedReports.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/50 bg-white/60 p-6">
              <p className="font-semibold text-slate-900">No reports yet.</p>
              <p className="mt-2 text-sm text-slate-500">
                Your live incident feed is empty until a real report is submitted.
              </p>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
