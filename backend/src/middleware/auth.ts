import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

declare global {
  namespace Express {
    interface Request {
      user?: { id: string; email: string; role: string };
    }
  }
}

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing authorization token" });
    return;
  }

  const token = authHeader.slice(7);

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser(token);

  if (error || !user) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }

  // Look up role and auth_provider from user_roles table
  const { data: roleRow } = await supabase
    .from("user_roles")
    .select("role, auth_provider")
    .eq("user_id", user.id)
    .single();

  // Verify auth provider matches (defense in depth against cross-provider bypass)
  if (roleRow?.auth_provider) {
    const tokenProvider = user.app_metadata?.provider ?? "email";
    const normalizedProvider = tokenProvider === "google" ? "google" : "email";
    if (normalizedProvider !== roleRow.auth_provider) {
      res.status(401).json({ error: "Invalid or expired token" });
      return;
    }
  }

  req.user = {
    id: user.id,
    email: user.email ?? "",
    role: roleRow?.role ?? "user",
  };
  next();
}
