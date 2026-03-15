import { Router } from "express";
import { getVoicesByLanguage } from "../services/voices.service";

export const voicesRouter = Router();

voicesRouter.get("/voices", (req, res) => {
  const language = (req.query.language as string) || "en";
  const voices = getVoicesByLanguage(language);
  res.json({ voices });
});
