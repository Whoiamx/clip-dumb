import { Router, Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authCheckRouter = Router();

authCheckRouter.post("/auth/check-provider", async (req: Request, res: Response) => {
  const { email, method } = req.body;

  if (!email || !method || !["email", "google"].includes(method)) {
    res.json({ allowed: true });
    return;
  }

  try {
    const { data, error } = await supabase.rpc("check_auth_provider", {
      lookup_email: email,
      login_method: method,
    });

    if (error) {
      // Don't reveal internal errors — default to allowed
      res.json({ allowed: true });
      return;
    }

    res.json({ allowed: data?.allowed ?? true });
  } catch {
    res.json({ allowed: true });
  }
});
