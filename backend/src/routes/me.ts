import { Router, Request, Response } from "express";

export const meRouter = Router();

meRouter.get("/auth/me", (req: Request, res: Response) => {
  if (!req.user) {
    res.status(401).json({ error: "Not authenticated" });
    return;
  }

  res.json({
    id: req.user.id,
    email: req.user.email,
    role: req.user.role,
  });
});
