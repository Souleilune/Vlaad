import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-white/60 bg-white/80 px-4 text-sm text-slate-700 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-softCoral/40",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
