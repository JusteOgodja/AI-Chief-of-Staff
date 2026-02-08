import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  variant?: "primary" | "accent" | "warning" | "danger";
  subtitle?: string;
  delay?: number;
  trend?: { value: number; label?: string };
}

const variantStyles = {
  primary: "gradient-primary",
  accent: "gradient-accent",
  warning: "gradient-warning",
  danger: "gradient-danger",
};

const variantIconBg = {
  primary: "bg-primary/10",
  accent: "bg-accent/10",
  warning: "bg-warning/10",
  danger: "bg-destructive/10",
};

const variantIconColor = {
  primary: "text-primary",
  accent: "text-accent",
  warning: "text-warning",
  danger: "text-destructive",
};

export default function MetricCard({ title, value, icon: Icon, variant = "primary", subtitle, delay = 0, trend }: MetricCardProps) {
  const trendColor = trend
    ? trend.value > 0
      ? "text-accent"
      : trend.value < 0
      ? "text-destructive"
      : "text-muted-foreground"
    : "";

  const TrendIcon = trend
    ? trend.value > 0
      ? TrendingUp
      : trend.value < 0
      ? TrendingDown
      : Minus
    : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="glass-card-hover rounded-xl p-5"
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight text-foreground">{value}</p>
          {trend && TrendIcon && (
            <div className={`flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-3 w-3" />
              <span className="text-xs font-medium">
                {trend.value > 0 ? "+" : ""}{trend.value}%
              </span>
              {trend.label && (
                <span className="text-[10px] text-muted-foreground ml-0.5">{trend.label}</span>
              )}
            </div>
          )}
          {!trend && subtitle && (
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${variantIconBg[variant]}`}>
          <Icon className={`h-5 w-5 ${variantIconColor[variant]}`} />
        </div>
      </div>
    </motion.div>
  );
}
