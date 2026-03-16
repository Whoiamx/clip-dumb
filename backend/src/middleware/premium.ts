import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function requirePremium(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("plan, status, current_period_end")
    .eq("user_id", req.user.id)
    .in("plan", ["plus", "teams", "pro"])
    .eq("status", "active")
    .gt("current_period_end", new Date().toISOString())
    .single();

  if (!subscription) {
    res.status(403).json({ error: "Premium subscription required" });
    return;
  }

  req.subscription = { plan: subscription.plan, status: subscription.status };
  next();
}
