"use client";

import { useEffect, useState } from "react";
import { Users, CreditCard, DollarSign, FolderOpen, UserPlus } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { apiFetch } from "@/lib/api-fetch";
import { StatCard } from "@/components/admin/StatCard";
import { ChartCard } from "@/components/admin/ChartCard";

interface OverviewStats {
  totalUsers: number;
  activeSubs: number;
  mrr: number;
  projectsToday: number;
  newUsersToday: number;
}

interface RegPoint { date: string; count: number }
interface RevPoint { month: string; revenue: number }

const PLAN_COLORS: Record<string, string> = {
  trial: "#94a3b8",
  plus: "#3b82f6",
  teams: "#8b5cf6",
  pro: "#f59e0b",
};

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<OverviewStats | null>(null);
  const [registrations, setRegistrations] = useState<RegPoint[]>([]);
  const [revenue, setRevenue] = useState<RevPoint[]>([]);
  const [subBreakdown, setSubBreakdown] = useState<Record<string, { active: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, regRes, revRes, subsRes] = await Promise.all([
          apiFetch("/api/admin/overview"),
          apiFetch("/api/admin/registrations?days=30"),
          apiFetch("/api/admin/revenue?months=6"),
          apiFetch("/api/admin/subscriptions"),
        ]);

        if (statsRes.ok) setStats(await statsRes.json());
        if (regRes.ok) setRegistrations(await regRes.json());
        if (revRes.ok) setRevenue(await revRes.json());
        if (subsRes.ok) setSubBreakdown(await subsRes.json());
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

  const pieData = Object.entries(subBreakdown).map(([plan, data]) => ({
    name: plan.charAt(0).toUpperCase() + plan.slice(1),
    value: (data as { active: number }).active,
    color: PLAN_COLORS[plan] ?? "#64748b",
  })).filter((d) => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <StatCard label="Total Users" value={stats?.totalUsers ?? 0} icon={Users} />
        <StatCard label="Active Subs" value={stats?.activeSubs ?? 0} icon={CreditCard} />
        <StatCard
          label="MRR"
          value={`$${(stats?.mrr ?? 0).toLocaleString()}`}
          icon={DollarSign}
        />
        <StatCard label="Projects Today" value={stats?.projectsToday ?? 0} icon={FolderOpen} />
        <StatCard label="New Users Today" value={stats?.newUsersToday ?? 0} icon={UserPlus} />
      </div>

      {/* Charts row */}
      <div className="grid gap-4 lg:grid-cols-2">
        <ChartCard title="User Registrations (30 days)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrations}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickFormatter={(v: string) => v.slice(5)}
                />
                <YAxis tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="var(--color-primary)"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Revenue Trend (6 months)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                <XAxis
                  dataKey="month"
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }}
                  tickFormatter={(v: number) => `$${v}`}
                />
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
      </div>

      {/* Subscription breakdown */}
      {pieData.length > 0 && (
        <ChartCard title="Subscription Breakdown" className="lg:max-w-md">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={90}
                  paddingAngle={2}
                  label={({ name, value }: { name: string; value: number }) => `${name}: ${value}`}
                >
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
