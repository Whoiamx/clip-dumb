"use client";

import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
}

export function StatCard({ label, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="rounded-xl border border-border/40 bg-surface p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">{label}</span>
        <div className="rounded-lg bg-primary/10 p-2">
          <Icon className="h-4 w-4 text-primary" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-2xl font-semibold text-foreground">{value}</span>
        {trend && (
          <span
            className={`ml-2 text-xs font-medium ${
              trendUp ? "text-emerald-500" : "text-red-400"
            }`}
          >
            {trend}
          </span>
        )}
      </div>
    </div>
  );
}
