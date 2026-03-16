"use client";

import { Palette, Music, Clock } from "lucide-react";
import { useWebsiteWizardStore } from "@/lib/store/website-wizard-store";
import type { WebsiteShowcaseScript } from "@/lib/types/website-showcase";

const MOOD_OPTIONS: { value: WebsiteShowcaseScript["musicMood"]; label: string; description: string }[] = [
  { value: "upbeat", label: "Upbeat", description: "Energetic and positive" },
  { value: "corporate", label: "Corporate", description: "Professional and polished" },
  { value: "minimal", label: "Minimal", description: "Clean and subtle" },
  { value: "energetic", label: "Energetic", description: "Fast-paced and dynamic" },
];

export function StepCustomize() {
  const { script, updateScript } = useWebsiteWizardStore();

  if (!script) return null;

  const totalSeconds = (script.totalDurationFrames / 30).toFixed(0);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h2 className="text-xl font-bold text-foreground">Customize Your Video</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fine-tune brand colors, music mood, and scene durations.
        </p>
      </div>

      {/* Brand Colors */}
      <div className="rounded-xl border border-border/30 bg-surface/50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Palette className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Brand Colors</h3>
        </div>
        <div className="grid grid-cols-3 gap-4">
          {(["primary", "secondary", "accent"] as const).map((key) => (
            <div key={key}>
              <label className="mb-1.5 block text-xs font-medium capitalize text-muted-foreground">
                {key}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={script.brandColors[key]}
                  onChange={(e) =>
                    updateScript((s) => ({
                      ...s,
                      brandColors: { ...s.brandColors, [key]: e.target.value },
                    }))
                  }
                  className="h-9 w-9 cursor-pointer rounded-lg border border-border/40"
                />
                <input
                  type="text"
                  value={script.brandColors[key]}
                  onChange={(e) =>
                    updateScript((s) => ({
                      ...s,
                      brandColors: { ...s.brandColors, [key]: e.target.value },
                    }))
                  }
                  className="flex-1 rounded-lg border border-border/40 bg-surface py-1.5 px-2.5 text-xs font-mono text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Music Mood */}
      <div className="rounded-xl border border-border/30 bg-surface/50 p-5">
        <div className="mb-4 flex items-center gap-2">
          <Music className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">Music Mood</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.value}
              onClick={() => updateScript((s) => ({ ...s, musicMood: mood.value }))}
              className={`rounded-lg border p-3 text-left transition-all ${
                script.musicMood === mood.value
                  ? "border-primary bg-primary/5"
                  : "border-border/40 hover:border-border"
              }`}
            >
              <div className="text-sm font-medium text-foreground">{mood.label}</div>
              <div className="text-xs text-muted-foreground">{mood.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Scene Durations */}
      <div className="rounded-xl border border-border/30 bg-surface/50 p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            <h3 className="text-sm font-semibold text-foreground">Scene Durations</h3>
          </div>
          <span className="text-xs text-muted-foreground">Total: {totalSeconds}s</span>
        </div>
        <div className="space-y-4">
          {script.scenes.map((scene) => (
            <div key={scene.id}>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-xs font-medium text-foreground">{scene.title}</span>
                <span className="text-xs text-muted-foreground">
                  {(scene.durationFrames / 30).toFixed(1)}s
                </span>
              </div>
              <input
                type="range"
                min={90}
                max={180}
                step={15}
                value={scene.durationFrames}
                onChange={(e) => {
                  const newDuration = Number(e.target.value);
                  updateScript((s) => ({
                    ...s,
                    scenes: s.scenes.map((sc) =>
                      sc.id === scene.id ? { ...sc, durationFrames: newDuration } : sc
                    ),
                    totalDurationFrames: s.scenes.reduce(
                      (sum, sc) => sum + (sc.id === scene.id ? newDuration : sc.durationFrames),
                      0
                    ),
                  }));
                }}
                className="w-full accent-primary"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
