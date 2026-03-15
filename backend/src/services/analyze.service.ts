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

  return `You are an AI specialized in generating step-by-step tutorial subtitles for application interfaces based on a video.

LANGUAGE: Write ALL subtitle text in ${langName}.

# Core Goal

Generate subtitles that explain how to perform the task in the application step by step.
Each subtitle represents one action the user performs in the interface.
The output must allow someone to follow the steps and replicate the process inside the app.

# Output Format

Return valid JSON only, no markdown:
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

# Structure Rules

Each subtitle MUST follow: ACTION + INTERFACE ELEMENT

Correct examples:
- "Write the content in the text field."
- "Click the Publish button."
- "Click the clock icon to schedule the post."
- "Select the date in the calendar."
- "Enter the time in the time field."
- "Click Schedule to confirm."

# Tutorial Behavior

Subtitles must read like a guided tutorial.

Rules:
1. Each subtitle represents one clear step.
2. Follow the exact order of actions shown in the video.
3. Maintain a logical step-by-step flow.
4. Do not combine multiple actions in one subtitle.
5. The result should feel like a tutorial explaining how to use the feature.

# Interface References

Reference interface elements when they are visible or clearly implied:
- button, text field, menu, dropdown, calendar, icon, checkbox, modal, toggle, sidebar, panel, tab

Correct:
- "Click the Schedule button."
- "Select the date in the calendar."
- "Enter the time in the time field."

Incorrect:
- "Access the scheduling options." (too abstract)
- "Configure the settings." (no specific element)
- "Open the configuration panel." (vague)

# Avoid These Problems

Do NOT:
- Invent interface elements that are not visible
- Describe internal system behavior
- Explain what the system does internally
- Add steps that are not part of the video

Incorrect:
- "Access the scheduling options."
- "The system opens the scheduling menu."
- "Configure the publication settings."

Correct:
- "Click the clock icon to schedule the post."
- "Select the date in the calendar."
- "Enter the time in the time field."

# Flow Consistency

The tutorial must follow one interaction path. Do NOT mix alternative flows.

Incorrect:
- "Click Publish to publish immediately."
- "Or click the clock icon to schedule."

Correct (follow what the video shows):
- "Click the clock icon to schedule the post."
- "Select the date."
- "Enter the time."
- "Click Schedule."

# Subtitle Writing Style

Use clear instructional verbs:
- Click — for buttons, links, icons, checkboxes, radio buttons
- Select — for dropdown options, list items, menu entries
- Type — for short text in inputs, search bars
- Enter — for longer values in form fields
- Choose — for picking from visible options
- Confirm — for final confirmation actions
- Toggle — for switches and on/off controls
- Drag — for drag-and-drop interactions
- Scroll — for scrolling to reveal content
- Hover — for hover-triggered menus or tooltips
- Open/Close — for modals, panels, sidebars
- Expand/Collapse — for accordions, tree nodes

The tone must feel like a clear instruction inside a tutorial.

# CRITICAL: Imperative Mode Only

ALL subtitles MUST use imperative verbs (direct commands to the user).

${language === "es" ? `Spanish imperative examples:
- "Haz clic en el botón Redactar."
- "Escribe el destinatario en el campo Para."
- "Selecciona el contacto del menú desplegable."
- "Haz clic en la flecha junto a Enviar."
- "Elige la fecha y hora de envío."
- "Ingresa tu contraseña en el campo."` : `English imperative examples:
- "Click the Compose button."
- "Type the recipient in the To field."
- "Select the contact from the dropdown menu."
- "Click the arrow next to Send."
- "Choose the date and time to send."
- "Enter your password in the field."`}

# CRITICAL: Never Use Passive Narration

NEVER describe what the system does. ONLY describe what the USER does.

${language === "es" ? `PROHIBIDO (narración pasiva):
- "Se abre la ventana de nuevo mensaje." ← INCORRECTO
- "Aparece el menú de programación." ← INCORRECTO
- "El sistema muestra las opciones." ← INCORRECTO
- "Se despliega el calendario." ← INCORRECTO

CORRECTO (instrucción imperativa):
- "Haz clic en el botón Redactar." ← CORRECTO
- "Selecciona Programar envío en el menú." ← CORRECTO
- "Haz clic en el icono del reloj." ← CORRECTO
- "Selecciona la fecha en el calendario." ← CORRECTO` : `FORBIDDEN (passive narration):
- "The new message window opens." ← WRONG
- "The scheduling menu appears." ← WRONG
- "The system displays the options." ← WRONG
- "The calendar expands." ← WRONG

CORRECT (imperative instruction):
- "Click the Compose button." ← CORRECT
- "Select Schedule Send from the menu." ← CORRECT
- "Click the clock icon." ← CORRECT
- "Select the date in the calendar." ← CORRECT`}

# Chapter Rules

- Group related steps into 2-5 logical chapters
- Each chapter = a logical section (e.g., "Setting Up", "Creating Content", "Publishing")
- Don't overlap subtitles within a chapter

# CRITICAL: Timing Rules

Understanding frameIndex and timing:
- Frames are captured every 2 seconds. frameIndex 0 = 0s, frameIndex 1 = 2s, frameIndex 2 = 4s, etc.
- The final timestamp in SRT format is: frameIndex × 2 = seconds. So frameIndex 3 = 00:00:06,000 (6 seconds), NOT 00:06:00,000 (6 minutes).
- durationFrames controls how long the subtitle is shown. At 30fps: 60 frames = 2 seconds, 90 frames = 3 seconds, 120 frames = 4 seconds.

Rules:
- Each subtitle MUST last between 2 and 4 seconds (durationFrames: 60-120 at 30fps, 120-240 at 60fps)
- NEVER generate frameIndex values that would place subtitles beyond the video duration
- If the video has N frames captured, frameIndex must be between 0 and N-1
- Subtitles must not overlap — the next subtitle's start must be after the previous subtitle ends
- Space subtitles sequentially: frameIndex should generally increase (0, 1, 2, 3...)
- Do NOT skip large gaps between frameIndex values unless there is genuinely nothing happening
- Animations: "scale" for important UI reveals, "typewriter" for technical steps, "slide-up" for transitions, "fade" for subtle moments

# Important Principle

The subtitles must read like instructions that teach the user how to use the feature shown in the video.

Always prioritize:
- Clarity
- Imperative verbs (commands to the user)
- Step-by-step instructions
- Interaction with interface elements
- Tutorial-style narration
- NEVER passive narration

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
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
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
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: getSystemPrompt(language),
    messages: [{ role: "user", content }],
  });

  const text =
    response.content[0].type === "text" ? response.content[0].text : "";

  const jsonObjMatch = text.match(/\{[\s\S]*\}/);
  const jsonArrMatch = text.match(/\[[\s\S]*\]/);

  // Sanitize a single AI result: clamp duration, ensure no overlap, respect video bounds
  const minDuration = fps * 2; // 2 seconds
  const maxDuration = fps * 4; // 4 seconds
  const maxFrame = videoDurationInFrames || Infinity;

  function sanitizeResult(result: FrameAnalysisResult): { startFrame: number; endFrame: number } {
    const startFrame = result.frameIndex * intervalSeconds * fps;
    let duration = result.durationFrames;

    // Clamp duration to 2-4 seconds
    if (duration < minDuration) duration = minDuration;
    if (duration > maxDuration) duration = maxDuration;

    let endFrame = startFrame + duration;

    // Don't exceed video duration
    if (isFinite(maxFrame) && endFrame > maxFrame) {
      endFrame = maxFrame;
    }

    return { startFrame, endFrame };
  }

  // Fix overlaps: if subtitle N starts before subtitle N-1 ends, push it forward
  function fixOverlaps(subs: SubtitleEntry[]): SubtitleEntry[] {
    const sorted = [...subs].sort((a, b) => a.startFrame - b.startFrame);
    for (let i = 1; i < sorted.length; i++) {
      if (sorted[i].startFrame < sorted[i - 1].endFrame) {
        const duration = sorted[i].endFrame - sorted[i].startFrame;
        sorted[i].startFrame = sorted[i - 1].endFrame;
        sorted[i].endFrame = sorted[i].startFrame + duration;

        // Clamp to video duration
        if (isFinite(maxFrame) && sorted[i].endFrame > maxFrame) {
          sorted[i].endFrame = maxFrame;
        }
      }
    }
    // Remove any zero-length or negative-length subtitles
    return sorted.filter((s) => s.endFrame > s.startFrame);
  }

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
    let allSubtitles: SubtitleEntry[] = [];
    const chapters: Chapter[] = [];

    for (const chResult of chapterResults) {
      const chapterId = nanoid();
      const subtitleIds: string[] = [];

      for (const result of chResult.subtitles) {
        const subId = nanoid();
        const { startFrame, endFrame } = sanitizeResult(result);

        subtitleIds.push(subId);

        allSubtitles.push({
          id: subId,
          text: result.text,
          startFrame,
          endFrame,
          position: { x: 0.5, y: 0.85 },
          style: { ...DEFAULT_STYLE },
          animation: result.animation || "fade",
          source: "ai",
        });
      }

      chapters.push({
        id: chapterId,
        title: chResult.title,
        startFrame: 0, // recalculated below
        endFrame: 0,
        subtitleIds,
      });
    }

    // Fix overlaps globally
    allSubtitles = fixOverlaps(allSubtitles);

    // Recalculate chapter bounds
    for (const ch of chapters) {
      const chSubs = allSubtitles.filter((s) => ch.subtitleIds.includes(s.id));
      if (chSubs.length > 0) {
        ch.startFrame = Math.min(...chSubs.map((s) => s.startFrame));
        ch.endFrame = Math.max(...chSubs.map((s) => s.endFrame));
      }
    }

    return { subtitles: allSubtitles, chapters };
  }

  // Fallback: flat array
  if (!jsonArrMatch) return { subtitles: [], chapters: [] };

  const results: FrameAnalysisResult[] = JSON.parse(jsonArrMatch[0]);
  let subtitles = results.map((result) => {
    const { startFrame, endFrame } = sanitizeResult(result);
    return {
      id: nanoid(),
      text: result.text,
      startFrame,
      endFrame,
      position: { x: 0.5, y: 0.85 },
      style: { ...DEFAULT_STYLE },
      animation: result.animation || "fade",
      source: "ai" as const,
    };
  });

  subtitles = fixOverlaps(subtitles);

  return { subtitles, chapters: [] };
}
