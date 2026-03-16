import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export function usageLogger(req: Request, res: Response, next: NextFunction) {
  res.on("finish", () => {
    if (!req.user?.id) return;

    supabase
      .from("api_usage_logs")
      .insert({
        user_id: req.user.id,
        endpoint: req.path,
        method: req.method,
        status_code: res.statusCode,
      })
      .then();
  });

  next();
}
