import { Router, Request, Response } from "express";
import { captureWebsite } from "../services/website-capture.service";
import { analyzeWebsite } from "../services/website-analyze.service";

export const websiteRouter = Router();

websiteRouter.post("/website/capture", async (req: Request, res: Response) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    res.status(400).json({ error: "URL is required" });
    return;
  }

  // Validate URL format
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(url);
    if (!["http:", "https:"].includes(parsedUrl.protocol)) {
      throw new Error("Invalid protocol");
    }
  } catch {
    res.status(400).json({ error: "Invalid URL. Must be a valid http or https URL." });
    return;
  }

  // Block private/internal IPs
  const hostname = parsedUrl.hostname;
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "0.0.0.0" ||
    hostname.startsWith("192.168.") ||
    hostname.startsWith("10.") ||
    hostname.startsWith("172.") ||
    hostname === "::1"
  ) {
    res.status(400).json({ error: "Internal URLs are not allowed" });
    return;
  }

  try {
    const result = await captureWebsite(url);
    res.json(result);
  } catch (error) {
    console.error("Website capture failed:", error);
    res.status(500).json({ error: "Failed to capture website. Please check the URL and try again." });
  }
});

websiteRouter.post("/website/analyze", async (req: Request, res: Response) => {
  const { captureId, screenshots, metadata } = req.body;

  if (!captureId || !screenshots || !Array.isArray(screenshots) || !metadata) {
    res.status(400).json({ error: "captureId, screenshots, and metadata are required" });
    return;
  }

  try {
    const script = await analyzeWebsite(screenshots, metadata);
    res.json(script);
  } catch (error) {
    console.error("Website analysis failed:", error);
    res.status(500).json({ error: "Failed to analyze website. Please try again." });
  }
});
