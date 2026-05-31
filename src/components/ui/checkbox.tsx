import * as React from "react";
import { cn } from "@/lib/utils";

export const Checkbox = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { label?: string }
>(({ className, label, id, ...props }, ref) => (
  <label
    htmlFor={id}
    className="flex items-center gap-2.5 cursor-pointer select-none"
  >
    <input
      ref={ref}
      id={id}
      type="checkbox"
      className={cn(
        "size-4.5 rounded border-border bg-card accent-[var(--color-primary)]",
        className,
      )}
      {...props}
    />
    {label && <span className="text-sm">{label}</span>}
  </label>
));
Checkbox.displayName = "Checkbox";
