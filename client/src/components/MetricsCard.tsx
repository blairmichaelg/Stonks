import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Activity } from "lucide-react";

interface MetricsCardProps {
  label: string;
  value: string | number;
  trend?: number; // percentage
  prefix?: string;
  suffix?: string;
  className?: string;
}

export function MetricsCard({ label, value, trend, prefix, suffix, className }: MetricsCardProps) {
  const isPositive = trend && trend > 0;
  
  return (
    <Card className={cn("bg-card border-border shadow-lg", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <Activity className="w-4 h-4 text-muted-foreground/50" />
        </div>
        
        <div className="mt-4 flex items-end justify-between">
          <div className="flex items-baseline gap-1">
            {prefix && <span className="text-xl font-medium text-muted-foreground">{prefix}</span>}
            <span className="text-3xl font-bold tracking-tight text-foreground font-mono">{value}</span>
            {suffix && <span className="text-xl font-medium text-muted-foreground">{suffix}</span>}
          </div>
          
          {trend !== undefined && (
            <div className={cn(
              "flex items-center text-xs font-semibold px-2 py-1 rounded-full",
              isPositive 
                ? "text-emerald-400 bg-emerald-400/10" 
                : "text-rose-400 bg-rose-400/10"
            )}>
              {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
              {Math.abs(trend)}%
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
