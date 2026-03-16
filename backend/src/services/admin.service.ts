import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function getOverviewStats() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

  const [usersRes, subsRes, projectsTodayRes, newUsersTodayRes, mrrRes] =
    await Promise.all([
      supabase.auth.admin.listUsers({ perPage: 1 }),
      supabase
        .from("subscriptions")
        .select("id", { count: "exact", head: true })
        .eq("status", "active"),
      supabase
        .from("projects_metadata")
        .select("id", { count: "exact", head: true })
        .gte("created_at", todayStart),
      supabase.auth.admin.listUsers({ perPage: 1000 }),
      supabase
        .from("subscriptions")
        .select("price_cents")
        .eq("status", "active"),
    ]);

  const totalUsers =
    usersRes.data?.users !== undefined
      ? (usersRes as unknown as { data: { users: unknown[]; total: number } }).data.total ?? 0
      : 0;

  // Count users created today
  const allUsers = newUsersTodayRes.data?.users ?? [];
  const newUsersToday = allUsers.filter(
    (u) => u.created_at && u.created_at >= todayStart
  ).length;

  const activeSubs = subsRes.count ?? 0;
  const projectsToday = projectsTodayRes.count ?? 0;

  const mrrCents = (mrrRes.data ?? []).reduce(
    (sum, s) => sum + (s.price_cents ?? 0),
    0
  );

  return {
    totalUsers,
    activeSubs,
    mrr: mrrCents / 100,
    projectsToday,
    newUsersToday,
  };
}

export async function getUsersList(
  page: number,
  limit: number,
  search: string,
  sortBy: string
) {
  const { data, error } = await supabase.auth.admin.listUsers({
    page,
    perPage: limit,
  });

  if (error) throw error;

  let users = (data.users ?? []).map((u) => ({
    id: u.id,
    email: u.email ?? "",
    name:
      (u.user_metadata?.full_name as string) ||
      (u.user_metadata?.name as string) ||
      u.email?.split("@")[0] ||
      "",
    avatarUrl:
      (u.user_metadata?.avatar_url as string) ||
      (u.user_metadata?.picture as string) ||
      null,
    provider: u.app_metadata?.provider ?? "email",
    createdAt: u.created_at,
    lastSignIn: u.last_sign_in_at ?? null,
  }));

  if (search) {
    const q = search.toLowerCase();
    users = users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) || u.name.toLowerCase().includes(q)
    );
  }

  // Attach subscription info
  const userIds = users.map((u) => u.id);
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("user_id, plan, status")
    .in("user_id", userIds)
    .eq("status", "active");

  const subMap = new Map((subs ?? []).map((s) => [s.user_id, s]));

  const enriched = users.map((u) => ({
    ...u,
    plan: subMap.get(u.id)?.plan ?? null,
  }));

  return {
    users: enriched,
    total: (data as unknown as { total?: number }).total ?? users.length,
    page,
    limit,
  };
}

export async function getUserDetail(userId: string) {
  const { data: userData, error } = await supabase.auth.admin.getUserById(userId);
  if (error || !userData.user) throw error ?? new Error("User not found");

  const u = userData.user;
  const [subRes, usageRes, roleRes] = await Promise.all([
    supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1),
    supabase
      .from("api_usage_logs")
      .select("endpoint, method, status_code, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50),
    supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .single(),
  ]);

  return {
    id: u.id,
    email: u.email ?? "",
    name:
      (u.user_metadata?.full_name as string) ||
      (u.user_metadata?.name as string) ||
      "",
    avatarUrl:
      (u.user_metadata?.avatar_url as string) ||
      (u.user_metadata?.picture as string) ||
      null,
    provider: u.app_metadata?.provider ?? "email",
    createdAt: u.created_at,
    lastSignIn: u.last_sign_in_at ?? null,
    role: roleRes.data?.role ?? "user",
    subscription: subRes.data?.[0] ?? null,
    recentUsage: usageRes.data ?? [],
  };
}

export async function getRegistrationTrend(days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  const users = data?.users ?? [];

  const counts: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    counts[d.toISOString().slice(0, 10)] = 0;
  }

  for (const u of users) {
    if (!u.created_at) continue;
    const day = u.created_at.slice(0, 10);
    if (day in counts) counts[day]++;
  }

  return Object.entries(counts).map(([date, count]) => ({ date, count }));
}

export async function getRevenueTrend(months: number) {
  const { data: subs } = await supabase
    .from("subscriptions")
    .select("price_cents, created_at, status")
    .eq("status", "active");

  const counts: Record<string, number> = {};
  for (let i = 0; i < months; i++) {
    const d = new Date();
    d.setMonth(d.getMonth() - (months - 1 - i));
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    counts[key] = 0;
  }

  for (const s of subs ?? []) {
    const key = s.created_at?.slice(0, 7);
    if (key && key in counts) counts[key] += s.price_cents;
  }

  return Object.entries(counts).map(([month, cents]) => ({
    month,
    revenue: cents / 100,
  }));
}

export async function getSubscriptionBreakdown() {
  const { data } = await supabase
    .from("subscriptions")
    .select("plan, status");

  const breakdown: Record<string, { active: number; canceled: number; expired: number; past_due: number }> = {
    trial: { active: 0, canceled: 0, expired: 0, past_due: 0 },
    plus: { active: 0, canceled: 0, expired: 0, past_due: 0 },
    teams: { active: 0, canceled: 0, expired: 0, past_due: 0 },
    pro: { active: 0, canceled: 0, expired: 0, past_due: 0 },
  };

  for (const s of data ?? []) {
    if (breakdown[s.plan] && s.status in breakdown[s.plan]) {
      (breakdown[s.plan] as Record<string, number>)[s.status]++;
    }
  }

  return breakdown;
}

export async function getApiUsageStats(days: number) {
  const since = new Date();
  since.setDate(since.getDate() - days);

  const { data } = await supabase
    .from("api_usage_logs")
    .select("endpoint, created_at")
    .gte("created_at", since.toISOString());

  // By day
  const byDay: Record<string, number> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - (days - 1 - i));
    byDay[d.toISOString().slice(0, 10)] = 0;
  }

  // By endpoint
  const byEndpoint: Record<string, number> = {};

  for (const row of data ?? []) {
    const day = row.created_at?.slice(0, 10);
    if (day && day in byDay) byDay[day]++;
    byEndpoint[row.endpoint] = (byEndpoint[row.endpoint] ?? 0) + 1;
  }

  return {
    byDay: Object.entries(byDay).map(([date, count]) => ({ date, count })),
    byEndpoint: Object.entries(byEndpoint)
      .map(([endpoint, count]) => ({ endpoint, count }))
      .sort((a, b) => b.count - a.count),
  };
}

export async function getTopUsersbyApiCalls(limit = 10) {
  const { data } = await supabase
    .from("api_usage_logs")
    .select("user_id");

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.user_id) counts[row.user_id] = (counts[row.user_id] ?? 0) + 1;
  }

  const sorted = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  // Get user emails
  const results = [];
  for (const [userId, callCount] of sorted) {
    const { data: userData } = await supabase.auth.admin.getUserById(userId);
    results.push({
      userId,
      email: userData.user?.email ?? "",
      name:
        (userData.user?.user_metadata?.full_name as string) ||
        (userData.user?.user_metadata?.name as string) ||
        "",
      callCount,
    });
  }

  return results;
}
