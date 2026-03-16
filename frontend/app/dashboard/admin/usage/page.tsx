"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import {
  LineChart, Line, BarChart, Bar,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import { apiFetch } from "@/lib/api-fetch";
import { ChartCard } from "@/components/admin/ChartCard";

interface DayPoint { date: string; count: number }
interface EndpointPoint { endpoint: string; count: number }
interface TopUser { userId: string; email: string; name: string; callCount: number }

export default function AdminUsagePage() {
  const [byDay, setByDay] = useState<DayPoint[]>([]);
  const [byEndpoint, setByEndpoint] = useState<EndpointPoint[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await apiFetch("/api/admin/usage?days=30");
        if (res.ok) {
          const data = await res.json();
          setByDay(data.byDay ?? []);
          setByEndpoint(data.byEndpoint ?? []);
          setTopUsers(data.topUsers ?? []);
        }
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

  const totalCalls = byDay.reduce((sum, d) => sum + d.count, 0);

  return (
    <div className="space-y-6">
      {/* Total calls */}
      <div className="rounded-xl border border-border/40 bg-surface p-5">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Total API Calls (30 days)</p>
            <p className="text-2xl font-semibold text-foreground">{totalCalls.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Daily calls chart */}
      <ChartCard title="API Calls Per Day (30 days)">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={byDay}>
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
              <Line type="monotone" dataKey="count" stroke="var(--color-primary)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* By endpoint */}
        <ChartCard title="Calls by Endpoint">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byEndpoint.slice(0, 8)} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" opacity={0.3} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "var(--color-muted-foreground)" }} />
                <YAxis
                  type="category"
                  dataKey="endpoint"
                  tick={{ fontSize: 10, fill: "var(--color-muted-foreground)" }}
                  width={140}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "var(--color-surface)",
                    border: "1px solid var(--color-border)",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="count" fill="var(--color-primary)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* Top users */}
        <div className="rounded-xl border border-border/40 bg-surface">
          <div className="border-b border-border/40 px-5 py-3">
            <h3 className="text-sm font-medium text-muted-foreground">Top Users by API Calls</h3>
          </div>
          <div className="divide-y divide-border/20">
            {topUsers.length === 0 ? (
              <p className="px-5 py-8 text-center text-sm text-muted-foreground">No usage data yet</p>
            ) : (
              topUsers.map((u, i) => (
                <div key={u.userId} className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted/50 text-xs font-medium text-muted-foreground">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-medium text-foreground">{u.name || u.email}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-foreground">{u.callCount.toLocaleString()}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
