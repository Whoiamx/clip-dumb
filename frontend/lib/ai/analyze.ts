import Anthropic from "@anthropic-ai/sdk";
import { ANALYZE_FRAMES_SYSTEM } from "./prompts";
import type { SubtitleEntry, Chapter } from "@/lib/types/project";
import { DEFAULT_SUBTITLE_STYLE } from "@/lib/types/project";
import { nanoid } from "nanoid";

interface FrameAnalysisResult {
  text: string;
  frameIndex: number;
  durationFrames: number;
  animation: "fade" | "slide-up" | "typewriter" | "scale";
}

interface ChapterAnalysisResult {
  title: string;
  subtitles: FrameAnalysisResult[];
}

export interface AnalyzeResult {
  subtitles: SubtitleEntry[];
  chapters: Chapter[];
}

export async function analyzeFrames(
  frames: string[],
  fps: number = 30,
  intervalSeconds: number = 2
): Promise<AnalyzeResult> {
  const anthropic = new Anthropic();

  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [
    {
      type: "text",
      text: `Analyze these ${frames.length} frames from a product demo video. Frames are captured every ${intervalSeconds} seconds at ${fps}fps. Group them into chapters and generate Apple-style subtitles for the key moments.`,
    },
    ...frames.map((frame) => ({
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: "image/jpeg" as const,
        data: frame,
      },
    })),
  ];

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-20250514",
    max_tokens: 2048,
    system: ANALYZE_FRAMES_SYSTEM,
    messages: [{ role: "user", content }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  // Try new chapters format first
  const jsonObjMatch = text.match(/\{[\s\S]*\}/);
  const jsonArrMatch = text.match(/\[[\s\S]*\]/);

  let chapterResults: ChapterAnalysisResult[] | null = null;

  if (jsonObjMatch) {
    try {
      const parsed = JSON.parse(jsonObjMatch[0]);
      if (parsed.chapters && Array.isArray(parsed.chapters)) {
        chapterResults = parsed.chapters;
      }
    } catch {
      // fall through to flat array
    }
  }

  if (chapterResults) {
    const allSubtitles: SubtitleEntry[] = [];
    const chapters: Chapter[] = [];

    for (const chResult of chapterResults) {
      const chapterId = nanoid();
      const subtitleIds: string[] = [];
      let chapterStart = Infinity;
      let chapterEnd = 0;

      for (const result of chResult.subtitles) {
        const subId = nanoid();
        const startFrame = result.frameIndex * intervalSeconds * fps;
        const endFrame = startFrame + result.durationFrames;

        subtitleIds.push(subId);
        chapterStart = Math.min(chapterStart, startFrame);
        chapterEnd = Math.max(chapterEnd, endFrame);

        allSubtitles.push({
          id: subId,
          text: result.text,
          startFrame,
          endFrame,
          position: { x: 0.5, y: 0.85 },
          style: { ...DEFAULT_SUBTITLE_STYLE },
          animation: result.animation,
          source: "ai" as const,
        });
      }

      chapters.push({
        id: chapterId,
        title: chResult.title,
        startFrame: chapterStart === Infinity ? 0 : chapterStart,
        endFrame: chapterEnd,
        subtitleIds,
      });
    }

    return { subtitles: allSubtitles, chapters };
  }

  // Fallback: flat array
  if (!jsonArrMatch) return { subtitles: [], chapters: [] };

  const results: FrameAnalysisResult[] = JSON.parse(jsonArrMatch[0]);
  const subtitles = results.map((result) => {
    const startFrame = result.frameIndex * intervalSeconds * fps;
    return {
      id: nanoid(),
      text: result.text,
      startFrame,
      endFrame: startFrame + result.durationFrames,
      position: { x: 0.5, y: 0.85 },
      style: { ...DEFAULT_SUBTITLE_STYLE },
      animation: result.animation,
      source: "ai" as const,
    };
  });

  return { subtitles, chapters: [] };
}
