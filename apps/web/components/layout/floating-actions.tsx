import Link from "next/link";
import { BellPlus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export function FloatingActions() {
  return (
    <div className="fixed bottom-6 left-1/2 z-40 flex -translate-x-1/2 items-center gap-3 rounded-full border border-white/50 bg-white/75 px-3 py-3 shadow-float backdrop-blur-xl lg:left-auto lg:right-6 lg:translate-x-0">
      <Link href="/reports">
        <Button variant="pixel" size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Report
        </Button>
      </Link>
      <Button variant="secondary" size="icon" aria-label="Create alert">
        <BellPlus className="h-4 w-4" />
      </Button>
    </div>
  );
}
