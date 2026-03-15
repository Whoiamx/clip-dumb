import { Router } from "express";
import { analyzeFrames } from "../services/analyze.service";

export const analyzeRouter = Router();

analyzeRouter.post("/analyze-frames", async (req, res) => {
  try {
    const { frames, fps, language, videoDurationInFrames } = req.body;

    if (!frames || !Array.isArray(frames) || frames.length === 0) {
      res.status(400).json({ error: "frames array is required" });
      return;
    }

    const result = await analyzeFrames(
      frames,
      fps || 30,
      language || "en",
      videoDurationInFrames
    );

    res.json(result);
  } catch (err: any) {
    console.error("analyze-frames error:", err);
    res.status(500).json({ error: err.message || "Analysis failed" });
  }
});
