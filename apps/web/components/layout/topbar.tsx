import { Bell, Search } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function Topbar() {
  return (
    <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <Badge className="mb-3 bg-mint/30 text-slate-700">Realtime Blood Feed</Badge>
        <h1 className="text-3xl font-semibold text-slate-900">Track urgent needs and available blood in one live map.</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative min-w-72">
          <Search className="pointer-events-none absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
          <Input className="pl-10" placeholder="Search blood type, city, or request..." />
        </div>
        <Button variant="secondary" size="icon" aria-label="Notifications">
          <Bell className="h-4 w-4" />
        </Button>
        <LogoutButton />
      </div>
    </div>
  );
}
