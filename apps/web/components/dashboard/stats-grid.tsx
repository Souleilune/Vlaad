import type { DashboardMetric } from "@vlaad/shared";
import { ArrowUpRight, HeartPulse, ShieldCheck, Siren } from "lucide-react";
import { Card } from "@/components/ui/card";

const icons = [HeartPulse, Siren, ShieldCheck, ArrowUpRight];

export function StatsGrid({ metrics }: { metrics: DashboardMetric[] }) {
  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {metrics.map((metric, index) => {
        const Icon = icons[index % icons.length];

        return (
          <Card key={metric.label} className="relative overflow-hidden">
            <div className="absolute right-4 top-4 rounded-2xl bg-softCoral/10 p-3 text-softCoral">
              <Icon className="h-5 w-5" />
            </div>
            <p className="text-sm text-slate-500">{metric.label}</p>
            <p className="mt-4 text-3xl font-semibold text-slate-900">{metric.value}</p>
            {metric.trend ? <p className="mt-2 text-sm text-mint">+ {metric.trend}</p> : null}
          </Card>
        );
      })}
    </div>
  );
}
