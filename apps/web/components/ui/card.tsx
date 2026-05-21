import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-softCoral/12 bg-[#faf7f5] p-6 shadow-neu",
        className
      )}
      {...props}
    />
  );
}
