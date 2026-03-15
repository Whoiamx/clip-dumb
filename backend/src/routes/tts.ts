import { Router } from "express";
import { generateVoicePreview, generateTTS } from "../services/tts.service";

export const ttsRouter = Router();

ttsRouter.post("/voice-preview", async (req, res) => {
  try {
    const { voiceId, language } = req.body;

    if (!voiceId) {
      res.status(400).json({ error: "voiceId is required" });
      return;
    }

    const audioBuffer = await generateVoicePreview(voiceId, language || "en");

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length.toString(),
    });
    res.send(audioBuffer);
  } catch (err: any) {
    console.error("voice-preview error:", err);
    res.status(500).json({ error: err.message || "Preview generation failed" });
  }
});

ttsRouter.post("/tts", async (req, res) => {
  try {
    const { text, voiceId, language } = req.body;

    if (!text || !voiceId) {
      res.status(400).json({ error: "text and voiceId are required" });
      return;
    }

    const audioBuffer = await generateTTS(text, voiceId, language || "en");

    res.set({
      "Content-Type": "audio/mpeg",
      "Content-Length": audioBuffer.length.toString(),
    });
    res.send(audioBuffer);
  } catch (err: any) {
    console.error("tts error:", err);
    res.status(500).json({ error: err.message || "TTS generation failed" });
  }
});
