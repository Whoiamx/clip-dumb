"use client";

import { useEffect, useCallback, useRef, useState } from "react";
import { useProjectStore } from "@/lib/store/project-store";
import { useEditorStore } from "@/lib/store/editor-store";
import { VideoPreview } from "@/components/editor/VideoPreview";
import { Timeline } from "@/components/editor/Timeline";
import { Slider } from "@/components/ui/slider";
import { Reorder } from "framer-motion";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Scissors,
  Plus,
  Trash2,
  ZoomIn,
  ZoomOut,
  GripVertical,
  Eye,
  ArrowUp,
  TypeIcon,
  Maximize2,
  Bold,
  Palette,
  AlignLeft,
  AlignCenter,
  AlignRight,
  MoveVertical,
  Undo2,
  Redo2,
} from "lucide-react";
import type { SubtitleEntry, SubtitleStyle } from "@/lib/types/project";

const FONT_OPTIONS = [
  { value: "Inter, system-ui, sans-serif", label: "Inter" },
  { value: "'Space Grotesk', sans-serif", label: "Space Grotesk" },
  { value: "'DM Sans', sans-serif", label: "DM Sans" },
  { value: "'JetBrains Mono', monospace", label: "JetBrains Mono" },
  { value: "Georgia, serif", label: "Georgia" },
  { value: "Arial, sans-serif", label: "Arial" },
];

const ANIMATIONS: {
  value: SubtitleEntry["animation"];
  label: string;
  icon: typeof Eye;
}[] = [
  { value: "fade", label: "Fade", icon: Eye },
  { value: "slide-up", label: "Slide", icon: ArrowUp },
  { value: "typewriter", label: "Type", icon: TypeIcon },
  { value: "scale", label: "Pop", icon: Maximize2 },
];

export function StepPreview() {
  const {
    project,
    addSubtitle,
    updateSubtitle,
    removeSubtitle,
    setSubtitles,
    setChapters,
    addTrimRegion,
    updateTrimRegion,
    removeTrimRegion,
    pushHistory,
    undo,
    redo,
  } = useProjectStore();
  const {
    currentFrame,
    isPlaying,
    setCurrentFrame,
    setIsPlaying,
    selectedSubtitleId,
    setSelectedSubtitle,
    zoomLevel,
    setZoomLevel,
  } = useEditorStore();

  const subtitleListRef = useRef<HTMLDivElement>(null);
  const [timelineSelection, setTimelineSelection] = useState<{ startFrame: number; endFrame: number } | null>(null);

  const fps = project.composition.fps;
  const rawDuration = project.video?.durationInFrames;
  const totalFrames =
    rawDuration && Number.isFinite(rawDuration) && rawDuration > 0
      ? Math.round(rawDuration)
      : 300;

  const selectedSub = project.subtitles.find(
    (s) => s.id === selectedSubtitleId
  );

  const chapters = project.chapters ?? [];

  // Derive global style from first subtitle (all share the same style)
  const globalStyle: SubtitleStyle = project.subtitles[0]?.style ?? {
    fontSize: 48,
    fontWeight: "bold",
    color: "#ffffff",
    fontFamily: "Inter, system-ui, sans-serif",
    textAlign: "center" as const,
    outlineColor: "#000000",
    outlineWidth: 0,
  };
  const globalAnimation: SubtitleEntry["animation"] =
    project.subtitles[0]?.animation ?? "fade";
  const globalPositionY: number = project.subtitles[0]?.position?.y ?? 0.85;

  // Reset state on mount
  useEffect(() => {
    setCurrentFrame(0);
    setSelectedSubtitle(null);
  }, [setCurrentFrame, setSelectedSubtitle]);

  // Keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLSelectElement
      )
        return;

      // Undo / Redo
      if ((e.ctrlKey || e.metaKey) && e.code === "KeyZ") {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
        return;
      }

      switch (e.code) {
        case "Space":
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentFrame(Math.max(0, currentFrame - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentFrame(Math.min(totalFrames - 1, currentFrame + 1));
          break;
        case "Delete":
        case "Backspace":
          if (selectedSubtitleId) {
            e.preventDefault();
            handleDeleteSubtitle();
          }
          break;
      }
    },
    [isPlaying, currentFrame, totalFrames, setIsPlaying, setCurrentFrame, selectedSubtitleId, undo, redo]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const formatTime = (frame: number) => {
    const s = frame / fps;
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  const handleAddSubtitle = () => {
    pushHistory();
    const sub = addSubtitle({
      startFrame: currentFrame,
      endFrame: Math.min(currentFrame + fps * 3, totalFrames),
      text: "New subtitle",
      style: { ...globalStyle },
      animation: globalAnimation,
      position: { x: 0.5, y: globalPositionY },
    });
    setSelectedSubtitle(sub.id);
  };

  const handleDeleteSubtitle = () => {
    if (!selectedSubtitleId) return;
    pushHistory();
    removeSubtitle(selectedSubtitleId);
    setSelectedSubtitle(null);
  };

  const handleCut = () => {
    if (!timelineSelection) return;
    pushHistory();
    addTrimRegion({
      startFrame: timelineSelection.startFrame,
      endFrame: timelineSelection.endFrame,
    });
    // Clear selection after creating trim
    setTimelineSelection(null);
  };

  // Apply style/position change to ALL subtitles at once
  const handleGlobalStyleChange = (updates: {
    style?: Partial<SubtitleStyle>;
    positionY?: number;
  }) => {
    if (project.subtitles.length === 0) return;
    pushHistory();
    const newSubtitles = project.subtitles.map((sub) => {
      const result = { ...sub };
      if (updates.style) {
        result.style = { ...sub.style, ...updates.style };
      }
      if (updates.positionY !== undefined) {
        result.position = { ...sub.position, y: updates.positionY };
      }
      return result;
    });
    setSubtitles(newSubtitles);
  };

  // Change animation for a single subtitle
  const handleSubtitleAnimationChange = (subId: string, animation: SubtitleEntry["animation"]) => {
    pushHistory();
    updateSubtitle(subId, { animation });
  };

  const handleReorder = useCallback(
    (newOrder: SubtitleEntry[]) => {
      pushHistory();
      const gap = Math.round(fps * 0.5);
      let frame = 0;
      const reordered = newOrder.map((sub) => {
        const duration = sub.endFrame - sub.startFrame;
        const startFrame = frame;
        const endFrame = Math.min(frame + duration, totalFrames);
        frame = endFrame + gap;
        return { ...sub, startFrame, endFrame };
      });
      setSubtitles(reordered);

      if (chapters.length > 0) {
        const newIdOrder = reordered.map((s) => s.id);
        const updatedChapters = chapters
          .map((ch) => ({
            ...ch,
            subtitleIds: ch.subtitleIds.filter((sid) => newIdOrder.includes(sid)),
          }))
          .filter((ch) => ch.subtitleIds.length > 0);
        setChapters(updatedChapters);
      }
    },
    [pushHistory, fps, totalFrames, setSubtitles, chapters, setChapters]
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div>
        <h2 className="font-display text-xl font-semibold">Preview & Edit</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Fine-tune subtitles, style, and timing with live preview
        </p>
      </div>

      {/* Video Preview */}
      <div className="w-full">
        <div className="overflow-hidden rounded-xl border border-border/40 bg-black">
          <div className="aspect-video">
            <VideoPreview />
          </div>
        </div>

        {/* Transport controls */}
        <div className="mt-3 flex items-center justify-center gap-3">
          <button
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            onClick={() => setCurrentFrame(0)}
            title="Go to start"
          >
            <SkipBack className="h-4 w-4" />
          </button>
          <button
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-white shadow-md shadow-primary/20 transition-transform hover:scale-105"
            onClick={() => setIsPlaying(!isPlaying)}
            title={isPlaying ? "Pause (Space)" : "Play (Space)"}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="ml-0.5 h-4 w-4" />
            )}
          </button>
          <button
            className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            onClick={() =>
              setCurrentFrame(Math.min(totalFrames - 1, currentFrame + fps))
            }
            title="Skip forward"
          >
            <SkipForward className="h-4 w-4" />
          </button>
          <span className="ml-2 font-mono text-xs tabular-nums text-muted-foreground">
            {formatTime(currentFrame)} / {formatTime(totalFrames)}
          </span>
        </div>
      </div>

      {/* Timeline */}
      <div className="overflow-hidden rounded-xl border border-border/40" style={{ height: 180 }}>
        <Timeline
          trimRegions={project.trimRegions}
          selection={timelineSelection}
          onSelectionChange={setTimelineSelection}
          onRemoveTrim={(id) => {
            pushHistory();
            removeTrimRegion(id);
          }}
          onUpdateTrim={(id, updates) => {
            updateTrimRegion(id, updates);
          }}
        />
      </div>

      {/* Timeline toolbar: Undo/Redo + Zoom + Cut — all in one row */}
      <div className="flex items-center justify-between">
        {/* Left: Undo / Redo */}
        <div className="flex items-center gap-1.5">
          <button
            className="flex items-center gap-1.5 rounded-lg border border-border/30 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            onClick={() => undo()}
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-3.5 w-3.5" />
            Undo
          </button>
          <button
            className="flex items-center gap-1.5 rounded-lg border border-border/30 px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            onClick={() => redo()}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-3.5 w-3.5" />
            Redo
          </button>
        </div>

        {/* Center: Zoom */}
        <div className="flex items-center gap-2">
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            onClick={() => setZoomLevel(zoomLevel - 0.25)}
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center font-mono text-xs text-muted-foreground">
            {Math.round(zoomLevel * 100)}%
          </span>
          <button
            className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground"
            onClick={() => setZoomLevel(zoomLevel + 0.25)}
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>

        {/* Right: Cut (only when selection exists) */}
        <div className="min-w-[120px] flex justify-end">
          {timelineSelection ? (
            <button
              className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/20 hover:text-red-300"
              onClick={handleCut}
              title="Cut selected range"
            >
              <Scissors className="h-3.5 w-3.5" />
              Cut Selection
            </button>
          ) : (
            <span className="text-[11px] text-muted-foreground/50">
              Drag timeline to select
            </span>
          )}
        </div>
      </div>

      {/* Bottom panels: Subtitles + Global Style */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Subtitle list panel */}
        <div className="flex flex-col rounded-xl border border-border/40 bg-surface/50">
          <div className="flex items-center justify-between border-b border-border/30 px-3 py-2">
            <h3 className="text-sm font-semibold">Subtitles</h3>
            <span className="font-mono text-[11px] text-muted-foreground">
              {project.subtitles.length} items
            </span>
          </div>

          <div
            ref={subtitleListRef}
            className="flex-1 overflow-y-auto p-2"
            style={{ maxHeight: 300 }}
          >
            {project.subtitles.length === 0 ? (
              <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
                No subtitles yet. Add one below or run AI analysis.
              </div>
            ) : (
              <Reorder.Group
                axis="y"
                values={project.subtitles}
                onReorder={handleReorder}
                className="flex flex-col gap-1"
              >
                {project.subtitles.map((sub, i) => (
                  <Reorder.Item
                    key={sub.id}
                    value={sub}
                    className={`group flex items-start gap-2 rounded-lg px-2 py-2 text-left transition-all ${
                      sub.id === selectedSubtitleId
                        ? "bg-primary/10 ring-1 ring-primary/30"
                        : "hover:bg-muted/40"
                    }`}
                    onClick={() => {
                      setSelectedSubtitle(sub.id);
                      setCurrentFrame(sub.startFrame);
                    }}
                  >
                    <div className="flex cursor-grab items-center self-stretch text-muted-foreground/30 active:cursor-grabbing">
                      <GripVertical className="h-3.5 w-3.5" />
                    </div>
                    <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-muted/50 font-mono text-[10px] text-muted-foreground">
                      {i + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{sub.text}</p>
                      <p className="font-mono text-[10px] text-muted-foreground">
                        {formatTime(sub.startFrame)} – {formatTime(sub.endFrame)}
                      </p>
                    </div>
                  </Reorder.Item>
                ))}
              </Reorder.Group>
            )}
          </div>

          {/* Selected subtitle edit: text + per-subtitle animation */}
          {selectedSub && (
            <div className="border-t border-border/30 p-2 space-y-2">
              <textarea
                className="w-full resize-none rounded-lg border border-border/30 bg-background p-2 text-xs focus:border-primary/40 focus:outline-none"
                rows={2}
                value={selectedSub.text}
                onChange={(e) => {
                  pushHistory();
                  updateSubtitle(selectedSub.id, { text: e.target.value });
                }}
                placeholder="Edit subtitle text..."
              />
              {/* Per-subtitle animation picker */}
              <div>
                <label className="mb-1 block text-[11px] font-medium text-muted-foreground">
                  Animation
                </label>
                <div className="flex gap-1">
                  {ANIMATIONS.map((anim) => (
                    <button
                      key={anim.value}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-medium transition-all ${
                        selectedSub.animation === anim.value
                          ? "bg-primary/15 text-primary ring-1 ring-primary/30"
                          : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                      }`}
                      onClick={() =>
                        handleSubtitleAnimationChange(selectedSub.id, anim.value)
                      }
                    >
                      <anim.icon className="h-3 w-3" />
                      {anim.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Add / Delete buttons */}
          <div className="flex gap-2 border-t border-border/30 p-2">
            <button
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-muted/30 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
              onClick={handleAddSubtitle}
            >
              <Plus className="h-3.5 w-3.5" />
              Add
            </button>
            <button
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-muted/30 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-red-500/10 hover:text-red-400 disabled:opacity-30"
              onClick={handleDeleteSubtitle}
              disabled={!selectedSubtitleId}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          </div>
        </div>

        {/* Global Style panel — applies to ALL subtitles */}
        <div className="flex flex-col rounded-xl border border-border/40 bg-surface/50">
          <div className="border-b border-border/30 px-3 py-2">
            <h3 className="text-sm font-semibold">Subtitle Style</h3>
            <p className="text-[11px] text-muted-foreground">
              Changes apply to all subtitles
            </p>
          </div>

          {project.subtitles.length > 0 ? (
            <div className="flex flex-col gap-4 overflow-y-auto p-3" style={{ maxHeight: 380 }}>
              {/* Font family */}
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-muted-foreground">
                  Font
                </label>
                <select
                  value={globalStyle.fontFamily}
                  onChange={(e) =>
                    handleGlobalStyleChange({
                      style: { fontFamily: e.target.value },
                    })
                  }
                  className="w-full rounded-lg border border-border/40 bg-background px-3 py-1.5 text-sm focus:border-primary/40 focus:outline-none"
                >
                  {FONT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Font size */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                  Size
                  <span className="text-foreground/60">{globalStyle.fontSize}px</span>
                </label>
                <Slider
                  value={[globalStyle.fontSize]}
                  onValueChange={([v]) =>
                    handleGlobalStyleChange({ style: { fontSize: v } })
                  }
                  min={16}
                  max={96}
                  step={2}
                />
              </div>

              {/* Bold + Color + Alignment row */}
              <div className="flex items-center gap-2">
                <button
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                    globalStyle.fontWeight === "bold"
                      ? "border-primary/40 bg-primary/15 text-primary"
                      : "border-border/40 text-muted-foreground hover:bg-muted/40"
                  }`}
                  onClick={() =>
                    handleGlobalStyleChange({
                      style: {
                        fontWeight:
                          globalStyle.fontWeight === "bold" ? "normal" : "bold",
                      },
                    })
                  }
                  title="Bold"
                >
                  <Bold className="h-3.5 w-3.5" />
                </button>

                <div className="relative">
                  <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 text-muted-foreground hover:bg-muted/40">
                    <Palette className="h-3.5 w-3.5" />
                    <input
                      type="color"
                      value={globalStyle.color}
                      onChange={(e) =>
                        handleGlobalStyleChange({
                          style: { color: e.target.value },
                        })
                      }
                      className="absolute inset-0 cursor-pointer opacity-0"
                    />
                  </button>
                </div>

                <div
                  className="h-8 w-8 rounded-lg border border-border/40"
                  style={{ backgroundColor: globalStyle.color }}
                  title="Text color"
                />

                <div className="ml-auto flex gap-1">
                  {([
                    { value: "left" as const, icon: AlignLeft },
                    { value: "center" as const, icon: AlignCenter },
                    { value: "right" as const, icon: AlignRight },
                  ]).map((opt) => (
                    <button
                      key={opt.value}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-all ${
                        (globalStyle.textAlign ?? "center") === opt.value
                          ? "border-primary/40 bg-primary/15 text-primary"
                          : "border-border/40 text-muted-foreground hover:bg-muted/40"
                      }`}
                      onClick={() =>
                        handleGlobalStyleChange({
                          style: { textAlign: opt.value },
                        })
                      }
                      title={`Align ${opt.value}`}
                    >
                      <opt.icon className="h-3.5 w-3.5" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Vertical position */}
              <div>
                <label className="mb-1.5 flex items-center gap-1 text-[11px] font-medium text-muted-foreground">
                  <MoveVertical className="h-3 w-3" />
                  Position
                </label>
                <Slider
                  value={[Math.round(globalPositionY * 100)]}
                  onValueChange={([v]) =>
                    handleGlobalStyleChange({ positionY: v / 100 })
                  }
                  min={5}
                  max={95}
                  step={1}
                />
                <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
                  <span>Top</span>
                  <span>Bottom</span>
                </div>
              </div>

              {/* Outline */}
              <div>
                <label className="mb-1.5 flex items-center justify-between text-[11px] font-medium text-muted-foreground">
                  Outline
                  <span className="text-foreground/60">{globalStyle.outlineWidth ?? 0}px</span>
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <button className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 text-muted-foreground hover:bg-muted/40">
                      <Palette className="h-3.5 w-3.5" />
                      <input
                        type="color"
                        value={globalStyle.outlineColor ?? "#000000"}
                        onChange={(e) =>
                          handleGlobalStyleChange({
                            style: { outlineColor: e.target.value },
                          })
                        }
                        className="absolute inset-0 cursor-pointer opacity-0"
                      />
                    </button>
                  </div>
                  <div
                    className="h-8 w-8 shrink-0 rounded-lg border border-border/40"
                    style={{ backgroundColor: globalStyle.outlineColor ?? "#000000" }}
                  />
                  <div className="flex-1">
                    <Slider
                      value={[globalStyle.outlineWidth ?? 0]}
                      onValueChange={([v]) =>
                        handleGlobalStyleChange({
                          style: { outlineWidth: v },
                        })
                      }
                      min={0}
                      max={8}
                      step={1}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 items-center justify-center p-8 text-center text-xs text-muted-foreground">
              Add subtitles to customize their style
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
