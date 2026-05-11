"use client";

import Link from "next/link";
import { useState } from "react";
import { ClipboardPlus, LogIn, UserPlus } from "lucide-react";
import { ReportModal } from "@/components/reports/report-modal";
import { MapShell } from "@/components/map/map-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export function PublicHome() {
  const [reportModalOpen, setReportModalOpen] = useState(false);

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <ReportModal open={reportModalOpen} onClose={() => setReportModalOpen(false)} />
      <header className="mb-6 flex flex-col gap-4 rounded-[28px] border border-white/40 bg-white/65 px-5 py-4 shadow-glass backdrop-blur-xl lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="font-display text-2xl text-slate-900">VLAAD</p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Link href="/register">
            <Button variant="secondary">
              <UserPlus className="mr-2 h-4 w-4" />
              Register
            </Button>
          </Link>
          <Link href="/login">
            <Button>
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          </Link>
        </div>
      </header>

      <section aria-label="Public blood request and availability map">
        <MapShell />
      </section>

      <section className="mt-6" aria-label="Community posting action">
        <Card className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Badge className="mb-3 bg-pixelSky/35 text-slate-700">Community Reporting</Badge>
            <h2 className="text-2xl font-semibold text-slate-900">Need to post a request, donor offer, or blood bag availability?</h2>
            <p className="mt-2 text-sm text-slate-500">
              Guests can share urgent needs, volunteer donor availability, or institutional blood supply updates on the public feed.
            </p>
          </div>
          <Button variant="pixel" size="lg" onClick={() => setReportModalOpen(true)}>
            <ClipboardPlus className="mr-2 h-4 w-4" />
            Create a Post
          </Button>
        </Card>
      </section>
    </main>
  );
}
