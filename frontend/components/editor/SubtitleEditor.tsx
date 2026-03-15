"use client";

import { useProjectStore } from "@/lib/store/project-store";
import { useEditorStore } from "@/lib/store/editor-store";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Plus,
  Trash2,
  Type,
  Bold,
  Palette,
  Sparkles,
  MoveVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
} from "lucide-react";
import type { SubtitleEntry } from "@/lib/types/project";

const FONT_OPTIONS = [
  { value: "Inter, system-ui, sans-serif", label: "Inter" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk" },
  { value: "'DM Sans', sans-serif", label: "DM Sans" },
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Arial, sans-serif", label: "Arial" },
];

const ANIMATION_OPTIONS: { value: SubtitleEntry["animation"]; label: string }[] = [
  { value: "fade", label: "Fade" },
  { value: "slide-up", label: "Slide Up" },
  { value: "typewriter", label: "Typewriter" },
  { value: "scale", label: "Scale" },
];

export function SubtitleEditor() {
  const { project, addSubtitle, updateSubtitle, removeSubtitle, pushHistory } =
    useProjectStore();
  const { selectedSubtitleId, setSelectedSubtitle, currentFrame } =
    useEditorStore();

  const selectedSub = project.subtitles.find(
    (s) => s.id === selectedSubtitleId
  );

  const handleAdd = () => {
    pushHistory();
    const fps = project.composition.fps;
    const sub = addSubtitle({
      startFrame: currentFrame,
      endFrame: currentFrame + fps * 3,
    });
    setSelectedSubtitle(sub.id);
  };

  const handleUpdate = (updates: Partial<SubtitleEntry>) => {
    if (!selectedSub) return;
    pushHistory();
    updateSubtitle(selectedSub.id, updates);
  };

  const handleDelete = () => {
    if (!selectedSub) return;
    pushHistory();
    removeSubtitle(selectedSub.id);
    setSelectedSubtitle(null);
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold">Subtitles</h3>
        <Button size="sm" variant="outline" onClick={handleAdd} className="h-7 gap-1.5 rounded-full px-3 text-[11px]">
          <Plus className="h-3 w-3" />
          Add
        </Button>
      </div>

      {/* Subtitle list */}
      <div className="flex flex-col gap-0.5">
        {project.subtitles.map((sub) => (
          <button
            key={sub.id}
            className={`flex items-center gap-2 rounded-lg px-3 py-2 text-left text-xs transition-all ${
              sub.id === selectedSubtitleId
                ? "bg-primary/15 text-foreground ring-1 ring-primary/20"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground/80"
            }`}
            onClick={() => setSelectedSubtitle(sub.id)}
          >
            <Type className="h-3 w-3 shrink-0 opacity-40" />
            <span className="truncate">{sub.text}</span>
            {sub.source === "ai" && (
              <Sparkles className="ml-auto h-3 w-3 shrink-0 text-accent" />
            )}
          </button>
        ))}
        {project.subtitles.length === 0 && (
          <div className="rounded-xl border border-dashed border-border/40 py-8 text-center">
            <Type className="mx-auto h-5 w-5 text-muted-foreground/30" />
            <p className="mt-2 text-[11px] text-muted-foreground/50">
              No subtitles yet
            </p>
            <p className="text-[10px] text-muted-foreground/30">
              Click &quot;Add&quot; or use AI Analyze
            </p>
          </div>
        )}
      </div>

      {/* Edit selected subtitle */}
      {selectedSub && (
        <div className="flex flex-col gap-3 border-t border-border/30 pt-4">
          <h4 className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground/50">
            Edit Subtitle
          </h4>

          {/* Text */}
          <textarea
            className="min-h-[60px] resize-none rounded-lg border border-border/40 bg-muted/30 px-3 py-2.5 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/30 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            value={selectedSub.text}
            onChange={(e) => handleUpdate({ text: e.target.value })}
            placeholder="Enter subtitle text..."
          />

          {/* Animation */}
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
              Animation
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {ANIMATION_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  className={`rounded-lg px-3 py-1.5 text-[11px] font-medium transition-all ${
                    selectedSub.animation === opt.value
                      ? "bg-primary text-white shadow-sm shadow-primary/20"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground/80"
                  }`}
                  onClick={() => handleUpdate({ animation: opt.value })}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Font size */}
          <div>
            <label className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
              Font Size
              <span className="normal-case tracking-normal text-foreground/60">
                {selectedSub.style.fontSize}px
              </span>
            </label>
            <Slider
              value={[selectedSub.style.fontSize]}
              onValueChange={([v]) =>
                handleUpdate({ style: { ...selectedSub.style, fontSize: v } })
              }
              min={16}
              max={96}
              step={2}
            />
          </div>

          {/* Font weight + Color */}
          <div className="flex gap-2">
            <Button
              size="sm"
              className="h-8 w-8"
              variant={
                selectedSub.style.fontWeight === "bold" ? "default" : "outline"
              }
              onClick={() =>
                handleUpdate({
                  style: {
                    ...selectedSub.style,
                    fontWeight:
                      selectedSub.style.fontWeight === "bold"
                        ? "normal"
                        : "bold",
                  },
                })
              }
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>

            <div className="relative">
              <Button size="sm" variant="outline" className="relative h-8 w-8">
                <Palette className="h-3.5 w-3.5" />
                <input
                  type="color"
                  value={selectedSub.style.color}
                  onChange={(e) =>
                    handleUpdate({
                      style: { ...selectedSub.style, color: e.target.value },
                    })
                  }
                  className="absolute inset-0 cursor-pointer opacity-0"
                />
              </Button>
            </div>

            {/* Color swatch preview */}
            <div
              className="h-8 w-8 rounded-lg border border-border/40"
              style={{ backgroundColor: selectedSub.style.color }}
            />
          </div>

          {/* Font Family */}
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
              Font Family
            </label>
            <select
              value={selectedSub.style.fontFamily}
              onChange={(e) =>
                handleUpdate({
                  style: { ...selectedSub.style, fontFamily: e.target.value },
                })
              }
              className="w-full rounded-lg border border-border/40 bg-muted/30 px-3 py-1.5 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/20"
            >
              {FONT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Text Alignment */}
          <div>
            <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
              Alignment
            </label>
            <div className="flex gap-1.5">
              {([
                { value: "left" as const, icon: AlignLeft },
                { value: "center" as const, icon: AlignCenter },
                { value: "right" as const, icon: AlignRight },
              ]).map((opt) => (
                <Button
                  key={opt.value}
                  size="sm"
                  className="h-8 w-8"
                  variant={
                    (selectedSub.style.textAlign ?? "center") === opt.value
                      ? "default"
                      : "outline"
                  }
                  onClick={() =>
                    handleUpdate({
                      style: { ...selectedSub.style, textAlign: opt.value },
                    })
                  }
                >
                  <opt.icon className="h-3.5 w-3.5" />
                </Button>
              ))}
            </div>
          </div>

          {/* Outline */}
          <div>
            <label className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
              Outline
              <span className="normal-case tracking-normal text-foreground/60">
                {selectedSub.style.outlineWidth ?? 0}px
              </span>
            </label>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Button size="sm" variant="outline" className="relative h-8 w-8">
                  <Palette className="h-3.5 w-3.5" />
                  <input
                    type="color"
                    value={selectedSub.style.outlineColor ?? "#000000"}
                    onChange={(e) =>
                      handleUpdate({
                        style: {
                          ...selectedSub.style,
                          outlineColor: e.target.value,
                        },
                      })
                    }
                    className="absolute inset-0 cursor-pointer opacity-0"
                  />
                </Button>
              </div>
              <div
                className="h-8 w-8 rounded-lg border border-border/40"
                style={{ backgroundColor: selectedSub.style.outlineColor ?? "#000000" }}
              />
              <div className="flex-1">
                <Slider
                  value={[selectedSub.style.outlineWidth ?? 0]}
                  onValueChange={([v]) =>
                    handleUpdate({
                      style: { ...selectedSub.style, outlineWidth: v },
                    })
                  }
                  min={0}
                  max={8}
                  step={1}
                />
              </div>
            </div>
          </div>

          {/* Position Y */}
          <div>
            <label className="mb-2 flex items-center gap-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
              <MoveVertical className="h-3 w-3" />
              Vertical Position
            </label>
            <Slider
              value={[selectedSub.position.y * 100]}
              onValueChange={([v]) =>
                handleUpdate({
                  position: { ...selectedSub.position, y: v / 100 },
                })
              }
              min={5}
              max={95}
              step={1}
            />
          </div>

          <Button
            size="sm"
            variant="destructive"
            className="mt-2 rounded-lg"
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete Subtitle
          </Button>
        </div>
      )}
    </div>
  );
}
