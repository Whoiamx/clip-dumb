"use client";

import { useEffect, useState } from "react";
import { CreditCard, DollarSign, TrendingDown, Users } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { apiFetch } from "@/lib/api-fetch";
import { StatCard } from "@/components/admin/StatCard";
import { ChartCard } from "@/components/admin/ChartCard";

interface SubBreakdown {
  [plan: string]: { active: number; canceled: number; expired: number; past_due: number };
}

interface RevPoint { month: string; revenue: number }

export default function AdminSubscriptionsPage() {
  const [breakdown, setBreakdown] = useState<SubBreakdown>({});
  const [revenue, setRevenue] = useState<RevPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [subsRes, revRes] = await Promise.all([
          apiFetch("/api/admin/subscriptions"),
          apiFetch("/api/admin/revenue?months=6"),
        ]);
        if (subsRes.ok) setBreakdown(await subsRes.json());
        if (revRes.ok) setRevenue(await revRes.json());
      } catch {}
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  const plans = Object.entries(breakdown);
  const totalActive = plans.reduce((sum, [, d]) => sum + d.active, 0);
  const totalCanceled = plans.reduce((sum, [, d]) => sum + d.canceled, 0);
  const totalAll = plans.reduce(
    (sum, [, d]) => sum + d.active + d.canceled + d.expired + d.past_due,
    0
  );
  const churnRate = totalAll > 0 ? ((totalCanceled / totalAll) * 100).toFixed(1) : "0";

  const PLAN_PRICES: Record<string, number> = { trial: 0.99, plus: 19, teams: 49, pro: 199 };
  const mrr = plans.reduce((sum, [plan, d]) => sum + d.active * (PLAN_PRICES[plan] ?? 0), 0);

  const tableData = plans.map(([plan, d]) => ({
    plan: plan.charAt(0).toUpperCase() + plan.slice(1),
    active: d.active,
    canceled: d.canceled,
    expired: d.expired,
    pastDue: d.past_due,
  }));

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Active" value={totalActive} icon={CreditCard} />
        <StatCard label="Canceled" value={totalCanceled} icon={TrendingDown} />
        <StatCard label="MRR" value={`$${mrr.toLocaleString()}`} icon={DollarSign} />
        <StatCard label="Churn Rate" value={`${churnRate}%`} icon={Users} />
      </div>

      <ChartCard title="Revenue Trend (6 months)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
              <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} tickFormatter={(v: number) => `$${v}`} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "var(--color-surface)",
                  border: "1px solid var(--color-border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(value: number) => [`$${value}`, "Revenue"]}
              />
              <Bar dataKey="revenue" fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      {/* Plan breakdown table */}
      <div className="rounded-xl border border-border/40 bg-surface">
        <div className="border-b border-border/40 px-5 py-3">
          <h3 className="text-sm font-medium text-muted-foreground">Breakdown by Plan</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Plan</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Active</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Canceled</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Expired</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">Past Due</th>
              </tr>
            </thead>
            <tbody>
              {tableData.map((row) => (
                <tr key={row.plan} className="border-b border-border/20">
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{row.plan}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{row.active}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{row.canceled}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{row.expired}</td>
                  <td className="px-5 py-3 text-sm text-foreground">{row.pastDue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
