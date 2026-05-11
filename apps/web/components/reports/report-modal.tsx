"use client";

import { X } from "lucide-react";
import { ReportForm } from "@/components/reports/report-form";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

type ReportModalProps = {
  open: boolean;
  onClose: () => void;
};

export function ReportModal({ open, onClose }: ReportModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-950/45 px-4 py-6 backdrop-blur-sm">
      <div className="absolute inset-0" aria-hidden="true" onClick={onClose} />
      <Card className="scrollbar-hidden relative z-[1001] max-h-[90vh] w-full max-w-xl overflow-y-auto">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <Badge className="mb-3 bg-pixelSky/35 text-slate-700">Community Post Form</Badge>
            <h2 className="text-2xl font-semibold text-slate-900">Post a blood request or availability update</h2>
            <p className="mt-2 text-sm text-slate-500">
              Share what is needed, who can donate, or where blood bags are available without filling every field first.
            </p>
          </div>
          <Button variant="secondary" size="icon" aria-label="Close report form" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <ReportForm onSubmitted={onClose} />
      </Card>
    </div>
  );
}
