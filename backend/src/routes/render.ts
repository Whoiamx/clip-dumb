import { Router } from "express";
import { startRender, getRenderStatus } from "../services/render.service";

export const renderRouter = Router();

renderRouter.post("/render", (req, res) => {
  try {
    const { project, exportSettings } = req.body;

    if (!project) {
      res.status(400).json({ error: "project is required" });
      return;
    }

    const renderId = startRender(project, exportSettings);
    res.json({ renderId });
  } catch (err: any) {
    console.error("render error:", err);
    res.status(500).json({ error: err.message || "Render failed to start" });
  }
});

renderRouter.get("/render-status", (req, res) => {
  const id = req.query.id as string;

  if (!id) {
    res.status(400).json({ error: "id query parameter is required" });
    return;
  }

  const status = getRenderStatus(id);

  if (!status) {
    res.status(404).json({ error: "Render job not found" });
    return;
  }

  res.json({
    done: status.done,
    progress: status.progress,
    url: status.url,
    error: status.error,
  });
});
