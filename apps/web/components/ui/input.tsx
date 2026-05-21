import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-11 w-full rounded-2xl border border-softCoral/12 bg-[#f7f2ef] px-4 text-sm text-deepCrimson outline-none placeholder:text-deepCrimson/40 shadow-neuInset focus:ring-2 focus:ring-softCoral/30",
        className
      )}
      {...props}
    />
  )
);

Input.displayName = "Input";
