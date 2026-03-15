import "dotenv/config";
import express from "express";
import cors from "cors";
import { analyzeRouter } from "./routes/analyze";
import { voicesRouter } from "./routes/voices";
import { ttsRouter } from "./routes/tts";
import { uploadRouter } from "./routes/upload";
import { renderRouter } from "./routes/render";
import { languagesRouter } from "./routes/languages";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use("/uploads", express.static("uploads"));

app.use("/api", analyzeRouter);
app.use("/api", voicesRouter);
app.use("/api", ttsRouter);
app.use("/api", uploadRouter);
app.use("/api", renderRouter);
app.use("/api", languagesRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
