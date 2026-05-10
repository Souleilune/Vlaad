import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function ProfilePage() {
  return (
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <Card>
        <Badge className="mb-4 bg-mint/35">Trusted Contributor Journey</Badge>
        <h2 className="text-2xl font-semibold text-slate-900">No profile loaded</h2>
        <p className="mt-2 text-sm text-slate-500">
          This page no longer ships with a fake donor identity or fake achievements.
        </p>
      </Card>

      <Card>
        <Badge className="mb-4 bg-retroYellow/40 text-slate-900">Achievement Board</Badge>
        <p className="text-sm text-slate-600">
          Achievement badges, donation streaks, and trusted contributor levels will appear here once you
          connect real user progress data.
        </p>
      </Card>
    </div>
  );
}
