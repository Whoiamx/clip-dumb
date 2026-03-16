import Anthropic from "@anthropic-ai/sdk";
import { nanoid } from "nanoid";
import fs from "fs/promises";

interface WebsiteScene {
  id: string;
  type: "hero-reveal" | "feature-highlight" | "scroll-demo" | "stats" | "cta";
  title: string;
  subtitle?: string;
  screenshotIndex: number;
  durationFrames: number;
  animation: "zoom-in" | "parallax-scroll" | "slide-left" | "slide-right" | "perspective-3d" | "fade-scale";
  highlights?: { text: string; position: { x: number; y: number } }[];
  stats?: { label: string; value: string }[];
  features?: string[];
}

interface WebsiteShowcaseScript {
  websiteTitle: string;
  websiteTagline: string;
  brandColors: { primary: string; secondary: string; accent: string };
  scenes: WebsiteScene[];
  totalDurationFrames: number;
  musicMood: "upbeat" | "corporate" | "minimal" | "energetic";
}

const SYSTEM_PROMPT = `You are an AI that creates professional motion graphics video scripts from website screenshots.

# Task
Analyze the provided website screenshots and generate a showcase video script with exactly 5 scenes.

# Output Format
Return valid JSON only (no markdown fences):
{
  "websiteTitle": "Site name",
  "websiteTagline": "One-line value proposition",
  "brandColors": { "primary": "#hex", "secondary": "#hex", "accent": "#hex" },
  "scenes": [...],
  "totalDurationFrames": number,
  "musicMood": "upbeat" | "corporate" | "minimal" | "energetic"
}

# Scene Types (exactly 5, in this order)

1. **hero-reveal** — Opening scene showcasing the website's hero section
   - animation: "perspective-3d" or "zoom-in"
   - durationFrames: 120-150 (4-5s at 30fps)
   - screenshotIndex: 0 (hero screenshot)

2. **feature-highlight** — Key features or selling points
   - animation: "slide-left" or "slide-right"
   - durationFrames: 150-180 (5-6s at 30fps)
   - features: array of 3-4 feature strings
   - screenshotIndex: 1 or 2

3. **scroll-demo** — Smooth scroll through the full website
   - animation: "parallax-scroll"
   - durationFrames: 150-180 (5-6s at 30fps)
   - screenshotIndex: use the index of the full-page screenshot (last one)

4. **stats** — Key metrics, numbers, or achievements
   - animation: "fade-scale"
   - durationFrames: 120-150 (4-5s at 30fps)
   - stats: array of 3-4 { label, value } pairs. Infer realistic stats from the website content.
   - screenshotIndex: any relevant section

5. **cta** — Closing call-to-action
   - animation: "zoom-in" or "fade-scale"
   - durationFrames: 90-120 (3-4s at 30fps)
   - subtitle: compelling CTA text

# Rules
- Total video: 630-780 frames (21-26 seconds at 30fps)
- Each scene gets a unique id (short string)
- Extract brand colors from the visual design (dominant, secondary, accent)
- websiteTagline should be the site's actual tagline or a concise value proposition
- musicMood should match the site's personality (tech → minimal/corporate, creative → upbeat/energetic)
- stats values should be plausible (e.g., "10K+" users, "99.9%" uptime, "50+" integrations)
- features should be concise (3-5 words each)

Return valid JSON only.`;

export async function analyzeWebsite(
  screenshots: string[],
  metadata: { title: string; description: string; brandColors: string[] }
): Promise<WebsiteShowcaseScript> {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  // Read screenshots as base64
  const imageContent: Anthropic.MessageCreateParams["messages"][0]["content"] = [
    {
      type: "text",
      text: `Analyze these ${screenshots.length} screenshots of the website "${metadata.title}". Description: "${metadata.description}". Detected colors: ${metadata.brandColors.join(", ")}. Generate a 5-scene showcase video script.`,
    },
  ];

  for (const screenshotPath of screenshots) {
    const buffer = await fs.readFile(screenshotPath);
    const base64 = buffer.toString("base64");
    imageContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/png",
        data: base64,
      },
    });
  }

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: imageContent }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "";
  const jsonMatch = text.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("Failed to parse AI response as JSON");
  }

  const parsed = JSON.parse(jsonMatch[0]) as WebsiteShowcaseScript;

  // Post-processing: validate and clamp
  const FPS = 30;
  const MIN_SCENE_FRAMES = 90;  // 3s
  const MAX_SCENE_FRAMES = 180; // 6s
  const MAX_TOTAL_FRAMES = 1350; // 45s

  let totalFrames = 0;
  for (const scene of parsed.scenes) {
    scene.id = scene.id || nanoid(8);
    scene.durationFrames = Math.max(MIN_SCENE_FRAMES, Math.min(MAX_SCENE_FRAMES, scene.durationFrames));
    scene.screenshotIndex = Math.max(0, Math.min(screenshots.length - 1, scene.screenshotIndex));
    totalFrames += scene.durationFrames;
  }

  // If total exceeds max, proportionally scale down
  if (totalFrames > MAX_TOTAL_FRAMES) {
    const ratio = MAX_TOTAL_FRAMES / totalFrames;
    totalFrames = 0;
    for (const scene of parsed.scenes) {
      scene.durationFrames = Math.round(scene.durationFrames * ratio);
      scene.durationFrames = Math.max(MIN_SCENE_FRAMES, scene.durationFrames);
      totalFrames += scene.durationFrames;
    }
  }

  parsed.totalDurationFrames = totalFrames;

  // Ensure valid music mood
  const validMoods = ["upbeat", "corporate", "minimal", "energetic"] as const;
  if (!validMoods.includes(parsed.musicMood)) {
    parsed.musicMood = "corporate";
  }

  return parsed;
}
