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
        <Badge className="mb-4 bg-softGold/20 text-deepCrimson">Community Post Form</Badge>
        <ReportForm />
      </Card>

      <Card>
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <Badge className="mb-3 bg-softCoral/12 text-deepCrimson">Open Blood Feed</Badge>
            <h2 className="text-2xl font-semibold text-deepCrimson">Active blood requests, donor offers, and supply posts</h2>
          </div>
          <Badge>{sortedReports.length} live</Badge>
        </div>

        <div className="space-y-4">
          {loading ? <p className="text-sm text-deepCrimson/58">Loading reports...</p> : null}
          {sortedReports.map((report: BloodReport) => (
            <div key={report.id} className="rounded-[24px] border border-softCoral/14 bg-cleanWhite/84 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-lg font-semibold text-deepCrimson">{report.title}</h3>
                <Badge
                  className={
                    report.intent === "request"
                      ? "bg-softCoral/15 text-deepCrimson"
                      : "bg-softGold/18 text-deepCrimson"
                  }
                >
                  {report.intent === "request"
                    ? report.isEmergency
                      ? "Urgent request"
                      : "Request"
                    : report.intent === "inventory_offer"
                      ? "Blood bags available"
                      : "Donor / volunteer available"}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-deepCrimson/58">{report.address}</p>
              <p className="mt-2 text-sm text-deepCrimson/72">{report.description}</p>
              <div className="mt-3 flex items-center justify-between text-xs text-deepCrimson/52">
                <span>{report.bloodType}</span>
                <span>{new Date(report.createdAt).toLocaleString()}</span>
              </div>
            </div>
          ))}
          {!loading && sortedReports.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-softCoral/16 bg-cleanWhite/70 p-6">
              <p className="font-semibold text-deepCrimson">No reports yet.</p>
              <p className="mt-2 text-sm text-deepCrimson/58">
                Your live feed is empty until someone posts a real request or availability update.
              </p>
            </div>
          ) : null}
        </div>
      </Card>
    </div>
  );
}
