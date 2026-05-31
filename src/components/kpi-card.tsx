import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function KpiCard({
  label,
  value,
  hint,
  icon,
  className,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("", className)}>
      <CardContent className="pt-5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
            {label}
          </p>
          {icon && (
            <span className="flex size-8 items-center justify-center rounded-full bg-muted text-foreground">
              {icon}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold mt-2 tracking-tight">{value}</p>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}
