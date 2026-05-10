import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-[28px] border border-white/40 bg-white/70 p-6 shadow-glass backdrop-blur-xl",
        className
      )}
      {...props}
    />
  );
}
