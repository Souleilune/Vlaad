import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <Card>
        <Badge className="mb-4 bg-retroYellow/45 text-slate-800">Dashboard setup</Badge>
        <h2 className="text-2xl font-semibold text-slate-900">No user data is being faked here anymore.</h2>
        <p className="mt-3 max-w-2xl text-sm text-slate-600">
          This screen will stay empty until you connect real authenticated user data, donation history,
          notifications, and reputation records from Supabase or your API.
        </p>
      </Card>
    </div>
  );
}
