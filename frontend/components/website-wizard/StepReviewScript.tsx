"use client";

import { GripVertical, Trash2, ChevronDown } from "lucide-react";
import { useWebsiteWizardStore } from "@/lib/store/website-wizard-store";
import type { WebsiteScene } from "@/lib/types/website-showcase";

const SCENE_TYPE_LABELS: Record<WebsiteScene["type"], string> = {
  "hero-reveal": "Hero Reveal",
  "feature-highlight": "Feature Highlight",
  "scroll-demo": "Scroll Demo",
  stats: "Stats Counter",
  cta: "Call to Action",
};

const ANIMATION_OPTIONS: WebsiteScene["animation"][] = [
  "zoom-in",
  "parallax-scroll",
  "slide-left",
  "slide-right",
  "perspective-3d",
  "fade-scale",
];

export function StepReviewScript() {
  const { script, updateScript } = useWebsiteWizardStore();

  if (!script) return null;

  const updateScene = (id: string, updates: Partial<WebsiteScene>) => {
    updateScript((s) => ({
      ...s,
      scenes: s.scenes.map((scene) =>
        scene.id === id ? { ...scene, ...updates } : scene
      ),
    }));
  };

  const removeScene = (id: string) => {
    updateScript((s) => {
      const scenes = s.scenes.filter((scene) => scene.id !== id);
      return {
        ...s,
        scenes,
        totalDurationFrames: scenes.reduce((sum, sc) => sum + sc.durationFrames, 0),
      };
    });
  };

  const moveScene = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= script.scenes.length) return;
    updateScript((s) => {
      const scenes = [...s.scenes];
      const [moved] = scenes.splice(fromIndex, 1);
      scenes.splice(toIndex, 0, moved);
      return { ...s, scenes };
    });
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Review Video Script</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit scene text, reorder scenes, or change animation types. The AI generated{" "}
          {script.scenes.length} scenes ({(script.totalDurationFrames / 30).toFixed(0)}s total).
        </p>
      </div>

      {/* Title/tagline editing */}
      <div className="grid gap-4 rounded-xl border border-border/30 bg-surface/50 p-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Website Title
          </label>
          <input
            type="text"
            value={script.websiteTitle}
            onChange={(e) =>
              updateScript((s) => ({ ...s, websiteTitle: e.target.value }))
            }
            className="w-full rounded-lg border border-border/40 bg-surface py-2 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground">
            Tagline
          </label>
          <input
            type="text"
            value={script.websiteTagline}
            onChange={(e) =>
              updateScript((s) => ({ ...s, websiteTagline: e.target.value }))
            }
            className="w-full rounded-lg border border-border/40 bg-surface py-2 px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Scene list */}
      <div className="flex flex-col gap-3">
        {script.scenes.map((scene, i) => (
          <div
            key={scene.id}
            className="flex items-start gap-3 rounded-xl border border-border/30 bg-surface/50 p-4"
          >
            {/* Drag handle + reorder buttons */}
            <div className="flex flex-col items-center gap-1 pt-1">
              <button
                onClick={() => moveScene(i, i - 1)}
                disabled={i === 0}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronDown className="h-3.5 w-3.5 rotate-180" />
              </button>
              <GripVertical className="h-4 w-4 text-muted-foreground/40" />
              <button
                onClick={() => moveScene(i, i + 1)}
                disabled={i === script.scenes.length - 1}
                className="rounded p-0.5 text-muted-foreground hover:text-foreground disabled:opacity-30"
              >
                <ChevronDown className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Scene details */}
            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                  {SCENE_TYPE_LABELS[scene.type]}
                </span>
                <span className="text-xs text-muted-foreground">
                  {(scene.durationFrames / 30).toFixed(1)}s
                </span>
              </div>

              <input
                type="text"
                value={scene.title}
                onChange={(e) => updateScene(scene.id, { title: e.target.value })}
                className="w-full rounded-lg border border-border/40 bg-surface py-1.5 px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Scene title"
              />

              {scene.subtitle !== undefined && (
                <input
                  type="text"
                  value={scene.subtitle || ""}
                  onChange={(e) => updateScene(scene.id, { subtitle: e.target.value })}
                  className="w-full rounded-lg border border-border/40 bg-surface py-1.5 px-2.5 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Subtitle (optional)"
                />
              )}

              {/* Animation selector */}
              <select
                value={scene.animation}
                onChange={(e) =>
                  updateScene(scene.id, { animation: e.target.value as WebsiteScene["animation"] })
                }
                className="rounded-lg border border-border/40 bg-surface py-1.5 px-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {ANIMATION_OPTIONS.map((anim) => (
                  <option key={anim} value={anim}>
                    {anim.replace(/-/g, " ")}
                  </option>
                ))}
              </select>

              {/* Features list for feature-highlight */}
              {scene.features && (
                <div className="space-y-1">
                  {scene.features.map((feat, fi) => (
                    <input
                      key={fi}
                      type="text"
                      value={feat}
                      onChange={(e) => {
                        const newFeatures = [...(scene.features || [])];
                        newFeatures[fi] = e.target.value;
                        updateScene(scene.id, { features: newFeatures });
                      }}
                      className="w-full rounded border border-border/30 bg-surface py-1 px-2 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                    />
                  ))}
                </div>
              )}

              {/* Stats list for stats scene */}
              {scene.stats && (
                <div className="grid grid-cols-2 gap-2">
                  {scene.stats.map((stat, si) => (
                    <div key={si} className="flex gap-1">
                      <input
                        type="text"
                        value={stat.value}
                        onChange={(e) => {
                          const newStats = [...(scene.stats || [])];
                          newStats[si] = { ...newStats[si], value: e.target.value };
                          updateScene(scene.id, { stats: newStats });
                        }}
                        className="w-20 rounded border border-border/30 bg-surface py-1 px-2 text-xs font-semibold text-foreground focus:outline-none"
                        placeholder="Value"
                      />
                      <input
                        type="text"
                        value={stat.label}
                        onChange={(e) => {
                          const newStats = [...(scene.stats || [])];
                          newStats[si] = { ...newStats[si], label: e.target.value };
                          updateScene(scene.id, { stats: newStats });
                        }}
                        className="flex-1 rounded border border-border/30 bg-surface py-1 px-2 text-xs text-foreground focus:outline-none"
                        placeholder="Label"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Delete */}
            <button
              onClick={() => removeScene(scene.id)}
              disabled={script.scenes.length <= 1}
              className="mt-1 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-500 disabled:opacity-30"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
