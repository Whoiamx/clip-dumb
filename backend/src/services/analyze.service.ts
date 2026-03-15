import Anthropic from "@anthropic-ai/sdk";
import { nanoid } from "nanoid";

const LANGUAGE_NAMES: Record<string, string> = {
  en: "English",
  es: "Spanish",
  fr: "French",
  de: "German",
  pt: "Portuguese",
  ja: "Japanese",
  ko: "Korean",
  zh: "Chinese",
};

function getSystemPrompt(language: string): string {
  const langName = LANGUAGE_NAMES[language] || "English";

  return `You are an expert tutorial script writer. You create step-by-step narration for screen recording tutorials.

LANGUAGE: Write ALL subtitle text in ${langName}.

YOUR TASK:
Analyze the sequence of screenshots from a screen recording and generate narration subtitles that guide the viewer through each step.

OUTPUT FORMAT — return valid JSON only, no markdown:
{
  "chapters": [
    {
      "title": "Chapter title (short, descriptive, in ${langName})",
      "subtitles": [
        {
          "text": "Subtitle text (max 10 words)",
          "frameIndex": 0,
          "durationFrames": 90,
          "animation": "fade"
        }
      ]
    }
  ]
}

SUBTITLE STYLE — TUTORIAL: ACTION + UI ELEMENT
Every subtitle MUST name the specific UI element being interacted with.
- GOOD: "Click the 'New Project' button"
- GOOD: "Select 'Monthly' from the billing dropdown"
- GOOD: "Type your email in the login field"
- BAD: "Click here" (no element named)
- BAD: "Now we configure settings" (vague, no element)
- BAD: "This is the dashboard" (describing, not instructing)

VERB RULES — use specific verbs for each action type:
- Click/Tap: for buttons, links, icons, checkboxes, radio buttons
- Select: for dropdown options, list items, menu entries
- Type/Enter: for text inputs, search bars, forms ("Type" for short text, "Enter" for longer values)
- Toggle: for switches and on/off controls
- Drag: for drag-and-drop interactions
- Scroll: for scrolling to reveal content
- Hover: for hover-triggered menus or tooltips
- Open/Close: for modals, panels, sidebars
- Expand/Collapse: for accordions, tree nodes

SINGLE FLOW — follow ONE path only:
- Describe exactly what happens in the screenshots, step by step
- Do NOT mention alternative approaches ("you could also...", "another way is...")
- Do NOT describe what options exist unless the user is selecting one
- If a menu opens, only describe the option that gets selected

CHAPTER RULES:
- Group related steps into 2-5 logical chapters
- Each chapter = a logical section (e.g., "Setting Up", "Creating Content", "Publishing")
- Don't overlap subtitles within a chapter

TIMING:
- Typical duration: 60-120 frames at 30fps (2-4 seconds per subtitle)
- Use "scale" for important UI reveals, "typewriter" for technical steps, "slide-up" for transitions, "fade" for subtle moments

Return valid JSON only, no markdown.`;
}

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

interface SubtitleEntry {
  id: string;
  text: string;
  startFrame: number;
  endFrame: number;
  position: { x: number; y: number };
  style: {
    fontSize: number;
    fontWeight: "normal" | "bold";
    color: string;
    fontFamily: string;
    textAlign: "left" | "center" | "right";
    outlineColor: string;
    outlineWidth: number;
  };
  animation: "fade" | "slide-up" | "typewriter" | "scale";
  source: "ai";
}

interface Chapter {
  id: string;
  title: string;
  startFrame: number;
  endFrame: number;
  subtitleIds: string[];
}

const DEFAULT_STYLE = {
  fontSize: 48,
  fontWeight: "bold" as const,
  color: "#ffffff",
  fontFamily: "Inter, system-ui, sans-serif",
  textAlign: "center" as const,
  outlineColor: "#000000",
  outlineWidth: 0,
};

export async function analyzeFrames(
  frames: string[],
  fps: number = 30,
  language: string = "en",
  videoDurationInFrames?: number
): Promise<{ subtitles: SubtitleEntry[]; chapters: Chapter[] }> {
  const anthropic = new Anthropic();
  const intervalSeconds = 2;

  const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [
    {
      type: "text",
      text: `Analyze these ${frames.length} frames from a screen recording tutorial. Frames are captured every ${intervalSeconds} seconds at ${fps}fps.${videoDurationInFrames ? ` Total video duration: ${videoDurationInFrames} frames.` : ""} Generate step-by-step tutorial narration subtitles.`,
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
    model: "claude-haiku-4-5-20251001",
    max_tokens: 4096,
    system: getSystemPrompt(language),
    messages: [{ role: "user", content }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

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
          style: { ...DEFAULT_STYLE },
          animation: result.animation,
          source: "ai",
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
      style: { ...DEFAULT_STYLE },
      animation: result.animation,
      source: "ai" as const,
    };
  });

  return { subtitles, chapters: [] };
}
