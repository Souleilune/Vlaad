import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export default function AdminPage() {
  return (
    <Card>
      <Badge className="mb-4 bg-softCoral/20 text-slate-800">Admin monitor</Badge>
      <h2 className="text-2xl font-semibold text-slate-900">Admin panels are now empty by default.</h2>
      <p className="mt-3 max-w-2xl text-sm text-slate-600">
        The previous moderation and analytics cards were static placeholders. Connect these panels to live
        moderation, analytics, and flag endpoints when your admin data layer is ready.
      </p>
    </Card>
  );
}
