import "dotenv/config";
import express from "express";
import cors from "cors";
import { analyzeRouter } from "./routes/analyze";
import { voicesRouter } from "./routes/voices";
import { ttsRouter } from "./routes/tts";
import { uploadRouter } from "./routes/upload";
import { renderRouter } from "./routes/render";
import { languagesRouter } from "./routes/languages";
import { authCheckRouter } from "./routes/auth-check";
import { requireAuth } from "./middleware/auth";
import { usageLogger } from "./middleware/usage-logger";
import { adminRouter } from "./routes/admin";
import { meRouter } from "./routes/me";

const app = express();
const PORT = process.env.PORT || 4000;

const ALLOWED_ORIGINS = [
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || ALLOWED_ORIGINS.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("CORS: origin not allowed"));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", (_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  next();
}, express.static("uploads"));

// Public routes
app.use("/api", voicesRouter);
app.use("/api", languagesRouter);
app.use("/api", authCheckRouter);

// Protected routes — require valid Supabase auth token
app.use("/api", requireAuth, usageLogger, analyzeRouter);
app.use("/api", requireAuth, usageLogger, ttsRouter);
app.use("/api", requireAuth, usageLogger, uploadRouter);
app.use("/api", requireAuth, usageLogger, renderRouter);

// Auth route (protected, no usage logging)
app.use("/api", requireAuth, meRouter);

// Admin routes (protected + admin only)
app.use("/api", requireAuth, adminRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
