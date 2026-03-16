import { Router, Request, Response } from "express";
import { requireAdmin } from "../middleware/admin";
import {
  getOverviewStats,
  getUsersList,
  getUserDetail,
  getRegistrationTrend,
  getRevenueTrend,
  getSubscriptionBreakdown,
  getApiUsageStats,
  getTopUsersbyApiCalls,
} from "../services/admin.service";

export const adminRouter = Router();

adminRouter.use(requireAdmin);

adminRouter.get("/admin/overview", async (_req: Request, res: Response) => {
  try {
    const stats = await getOverviewStats();
    res.json(stats);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch overview stats" });
  }
});

adminRouter.get("/admin/users", async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = (req.query.search as string) || "";
    const sort = (req.query.sort as string) || "created_at";
    const data = await getUsersList(page, limit, search, sort);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

adminRouter.get("/admin/users/:id", async (req: Request<{ id: string }>, res: Response) => {
  try {
    const data = await getUserDetail(req.params.id);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch user detail" });
  }
});

adminRouter.get("/admin/registrations", async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const data = await getRegistrationTrend(days);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch registration trend" });
  }
});

adminRouter.get("/admin/revenue", async (req: Request, res: Response) => {
  try {
    const months = parseInt(req.query.months as string) || 6;
    const data = await getRevenueTrend(months);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch revenue trend" });
  }
});

adminRouter.get("/admin/subscriptions", async (_req: Request, res: Response) => {
  try {
    const data = await getSubscriptionBreakdown();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subscription breakdown" });
  }
});

adminRouter.get("/admin/usage", async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const [usageStats, topUsers] = await Promise.all([
      getApiUsageStats(days),
      getTopUsersbyApiCalls(),
    ]);
    res.json({ ...usageStats, topUsers });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch usage stats" });
  }
});
