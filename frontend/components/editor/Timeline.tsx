"use client";

import { useRef, useCallback, useEffect, useState } from "react";
import gsap from "gsap";
import { X } from "lucide-react";
import { useProjectStore } from "@/lib/store/project-store";
import { useEditorStore } from "@/lib/store/editor-store";
import { cn } from "@/lib/utils";
import { generateFrameStrip } from "@/lib/video/frame-strip";
import type { SubtitleEntry, TrimRegion } from "@/lib/types/project";

interface TimelineProps {
  trimRegions?: TrimRegion[];
  onAddTrim?: (startFrame: number, endFrame: number) => void;
  onUpdateTrim?: (id: string, updates: Partial<TrimRegion>) => void;
  onRemoveTrim?: (id: string) => void;
  /** Controlled selection — parent owns state */
  selection?: { startFrame: number; endFrame: number } | null;
  onSelectionChange?: (selection: { startFrame: number; endFrame: number } | null) => void;
}

export function Timeline({ trimRegions, onUpdateTrim, onRemoveTrim, selection, onSelectionChange }: TimelineProps) {
  const { project, updateSubtitle, pushHistory } = useProjectStore();
  const {
    currentFrame,
    setCurrentFrame,
    zoomLevel,
    setZoomLevel,
    selectedSubtitleId,
    setSelectedSubtitle,
  } = useEditorStore();

  const timelineRef = useRef<HTMLDivElement>(null);
  const playheadRef = useRef<HTMLDivElement>(null);
  const hasAutoFitRef = useRef(false);
  const hasDraggedRef = useRef(false);

  const [dragging, setDragging] = useState<{
    type: "playhead" | "subtitle-move" | "subtitle-start" | "subtitle-end" | "trim-start" | "trim-end" | "selection";
    subtitleId?: string;
    trimId?: string;
    startX: number;
    startFrame: number;
    originalStart?: number;
    originalEnd?: number;
  } | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const thumbCacheRef = useRef<{ url: string; thumbs: string[] } | null>(null);

  const rawTotalFrames = project.video?.durationInFrames;
  const totalFrames = rawTotalFrames && Number.isFinite(rawTotalFrames) && rawTotalFrames > 0 ? Math.round(rawTotalFrames) : 300;
  const fps = project.composition.fps;
  const pixelsPerFrame = zoomLevel * 2;
  const totalWidth = totalFrames * pixelsPerFrame;

  const frameToX = (frame: number) => frame * pixelsPerFrame;
  const xToFrame = useCallback(
    (x: number) => Math.max(0, Math.min(totalFrames - 1, Math.round(x / pixelsPerFrame))),
    [pixelsPerFrame, totalFrames]
  );

  // Auto-fit zoom on mount so the full video duration is visible
  useEffect(() => {
    if (hasAutoFitRef.current || !timelineRef.current || totalFrames <= 0) return;
    const containerWidth = timelineRef.current.clientWidth;
    if (containerWidth > 0) {
      const idealZoom = containerWidth / (totalFrames * 2);
      setZoomLevel(Math.max(0.1, Math.min(idealZoom, 2)));
      hasAutoFitRef.current = true;
    }
  }, [totalFrames, setZoomLevel]);

  useEffect(() => {
    if (playheadRef.current) {
      gsap.to(playheadRef.current, {
        x: frameToX(currentFrame),
        duration: 0.05,
        ease: "none",
      });
    }
  }, [currentFrame, pixelsPerFrame]);

  // Timeline background mousedown — starts selection or sets playhead
  const handleTimelineMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!timelineRef.current) return;
      const rect = timelineRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left + timelineRef.current.scrollLeft;
      const frame = xToFrame(x);

      // Clear previous selection
      onSelectionChange?.(null);
      hasDraggedRef.current = false;

      setDragging({
        type: "selection",
        startX: e.clientX,
        startFrame: frame,
        originalStart: frame,
      });
    },
    [xToFrame, onSelectionChange]
  );

  const handleMouseDown = useCallback(
    (
      e: React.MouseEvent,
      type: "playhead" | "subtitle-move" | "subtitle-start" | "subtitle-end" | "trim-start" | "trim-end",
      subtitleId?: string,
      trimId?: string
    ) => {
      e.stopPropagation();

      // Clear selection when starting element drag
      onSelectionChange?.(null);

      // Save history before drag so Ctrl+Z can undo
      if (type !== "playhead") {
        pushHistory();
      }

      // Capture original positions so drag calculates from the start, not current
      let originalStart: number | undefined;
      let originalEnd: number | undefined;

      if (subtitleId) {
        const sub = project.subtitles.find((s) => s.id === subtitleId);
        if (sub) {
          originalStart = sub.startFrame;
          originalEnd = sub.endFrame;
        }
      } else if (trimId && trimRegions) {
        const trim = trimRegions.find((t) => t.id === trimId);
        if (trim) {
          originalStart = trim.startFrame;
          originalEnd = trim.endFrame;
        }
      }

      setDragging({
        type,
        subtitleId,
        trimId,
        startX: e.clientX,
        startFrame: currentFrame,
        originalStart,
        originalEnd,
      });
    },
    [currentFrame, pushHistory, project.subtitles, trimRegions, onSelectionChange]
  );

  useEffect(() => {
    if (!dragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      const dx = e.clientX - dragging.startX;
      const dFrames = Math.round(dx / pixelsPerFrame);

      // Selection drag on timeline background
      if (dragging.type === "selection") {
        const endFrame = Math.max(0, Math.min(totalFrames - 1, dragging.startFrame + dFrames));
        const selStart = Math.min(dragging.startFrame, endFrame);
        const selEnd = Math.max(dragging.startFrame, endFrame);
        if (Math.abs(dFrames) > 1) {
          hasDraggedRef.current = true;
          onSelectionChange?.({ startFrame: selStart, endFrame: selEnd });
        }
        setCurrentFrame(endFrame);
        return;
      }

      if (dragging.type === "playhead") {
        setCurrentFrame(
          Math.max(0, Math.min(totalFrames - 1, dragging.startFrame + dFrames))
        );
        return;
      }

      // Subtitle drag — use originalStart/originalEnd so position doesn't compound
      if (dragging.subtitleId && dragging.originalStart !== undefined && dragging.originalEnd !== undefined) {
        if (dragging.type === "subtitle-move") {
          const duration = dragging.originalEnd - dragging.originalStart;
          const newStart = Math.max(0, Math.min(totalFrames - duration, dragging.originalStart + dFrames));
          updateSubtitle(dragging.subtitleId, {
            startFrame: newStart,
            endFrame: newStart + duration,
          });
        } else if (dragging.type === "subtitle-start") {
          const newStart = Math.max(0, Math.min(dragging.originalEnd - 5, dragging.originalStart + dFrames));
          updateSubtitle(dragging.subtitleId, { startFrame: newStart });
        } else if (dragging.type === "subtitle-end") {
          const newEnd = Math.max(dragging.originalStart + 5, dragging.originalEnd + dFrames);
          updateSubtitle(dragging.subtitleId, { endFrame: newEnd });
        }
      }

      // Trim drag
      if (dragging.trimId && onUpdateTrim && dragging.originalStart !== undefined && dragging.originalEnd !== undefined) {
        if (dragging.type === "trim-start") {
          const newStart = Math.max(0, Math.min(dragging.originalEnd - 5, dragging.originalStart + dFrames));
          onUpdateTrim(dragging.trimId, { startFrame: newStart });
        } else if (dragging.type === "trim-end") {
          const newEnd = Math.max(dragging.originalStart + 5, dragging.originalEnd + dFrames);
          onUpdateTrim(dragging.trimId, { endFrame: newEnd });
        }
      }
    };

    const handleMouseUp = () => {
      // If selection drag barely moved, treat as click to set playhead
      if (dragging.type === "selection" && !hasDraggedRef.current) {
        setCurrentFrame(dragging.startFrame);
        onSelectionChange?.(null);
      }
      hasDraggedRef.current = false;
      setDragging(null);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragging, pixelsPerFrame, totalFrames, setCurrentFrame, updateSubtitle, trimRegions, onUpdateTrim, onSelectionChange]);

  // Generate thumbnails
  useEffect(() => {
    const videoUrl = project.video?.url;
    const duration = project.video?.durationInSeconds;
    if (!videoUrl || !duration) {
      setThumbnails([]);
      return;
    }
    if (thumbCacheRef.current?.url === videoUrl) {
      setThumbnails(thumbCacheRef.current.thumbs);
      return;
    }
    let cancelled = false;
    generateFrameStrip(videoUrl, duration, 2, 160, 90).then((frames) => {
      if (cancelled) return;
      thumbCacheRef.current = { url: videoUrl, thumbs: frames };
      setThumbnails(frames);
    });
    return () => { cancelled = true; };
  }, [project.video?.url, project.video?.durationInSeconds]);

  // Time markers
  const markerInterval = Math.max(1, Math.round(fps / zoomLevel));
  const markers: number[] = [];
  for (let f = 0; f <= totalFrames; f += markerInterval) {
    markers.push(f);
  }

  const formatTime = (frame: number) => {
    const totalSeconds = frame / fps;
    const m = Math.floor(totalSeconds / 60);
    const s = Math.floor(totalSeconds % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex h-full flex-col border-t border-border/40 bg-surface">
      <div
        ref={timelineRef}
        className="relative cursor-crosshair overflow-x-auto overflow-y-auto"
        style={{ minHeight: thumbnails.length > 0 ? 190 : 140 }}
        onMouseDown={handleTimelineMouseDown}
      >
        <div style={{ width: totalWidth, minHeight: thumbnails.length > 0 ? 190 : 140, position: "relative" }}>
          {/* Markers */}
          <div className="flex h-6 items-end border-b border-border/30">
            {markers.map((f) => (
              <div
                key={f}
                className="absolute"
                style={{ left: frameToX(f) }}
              >
                <div className="h-2 w-px bg-border/50" />
                <span className="ml-0.5 font-mono text-[10px] tabular-nums text-muted-foreground/60">
                  {formatTime(f)}
                </span>
              </div>
            ))}
          </div>

          {/* Thumbnail strip */}
          {thumbnails.length > 0 && (
            <div className="flex h-[45px] items-stretch overflow-hidden opacity-60">
              {thumbnails.map((thumb, i) => {
                const thumbIntervalFrames = 2 * fps;
                const thumbWidth = thumbIntervalFrames * pixelsPerFrame;
                return (
                  <img
                    key={i}
                    src={thumb}
                    alt=""
                    className="h-full shrink-0 object-cover"
                    style={{ width: thumbWidth }}
                    draggable={false}
                  />
                );
              })}
            </div>
          )}

          {/* Selection overlay (controlled from parent) */}
          {selection && (
            <div
              className="absolute top-0 h-full pointer-events-none border-x-2 border-primary/50 bg-primary/10"
              style={{
                left: frameToX(selection.startFrame),
                width: Math.max(frameToX(selection.endFrame - selection.startFrame), 2),
                zIndex: 5,
              }}
            />
          )}

          {/* Subtitle tracks */}
          {(() => {
            // Assign lanes: subtitles that overlap in time go to different lanes
            const ROW_HEIGHT = 32;
            const SUB_HEIGHT = 28;
            const lanes: { endFrame: number }[] = [];
            const laneMap = new Map<string, number>();

            // Sort by startFrame for lane assignment
            const sorted = [...project.subtitles].sort((a, b) => a.startFrame - b.startFrame);
            for (const sub of sorted) {
              let assigned = false;
              for (let l = 0; l < lanes.length; l++) {
                if (sub.startFrame >= lanes[l].endFrame) {
                  lanes[l].endFrame = sub.endFrame;
                  laneMap.set(sub.id, l);
                  assigned = true;
                  break;
                }
              }
              if (!assigned) {
                laneMap.set(sub.id, lanes.length);
                lanes.push({ endFrame: sub.endFrame });
              }
            }

            const laneCount = Math.max(lanes.length, 1);
            const trackHeight = laneCount * ROW_HEIGHT + 4;

            return (
              <div className="relative mt-2" style={{ height: trackHeight }}>
                {project.subtitles.map((sub) => {
                  const left = frameToX(sub.startFrame);
                  const width = frameToX(sub.endFrame - sub.startFrame);
                  const isSelected = sub.id === selectedSubtitleId;
                  const lane = laneMap.get(sub.id) ?? 0;

                  return (
                    <div
                      key={sub.id}
                      className={cn(
                        "absolute flex items-center rounded-md text-xs transition-all cursor-grab active:cursor-grabbing border",
                        isSelected
                          ? "bg-primary/35 text-foreground ring-1 ring-primary/50 border-primary/50"
                          : "bg-primary/20 text-foreground/80 border-primary/30 hover:bg-primary/30"
                      )}
                      style={{
                        left,
                        width: Math.max(width, 20),
                        top: lane * ROW_HEIGHT + 2,
                        height: SUB_HEIGHT,
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubtitle(sub.id);
                      }}
                      onMouseDown={(e) => handleMouseDown(e, "subtitle-move", sub.id)}
                    >
                      {/* Resize handle left */}
                      <div
                        className="absolute left-0 top-0 h-full w-2 cursor-col-resize rounded-l-md bg-primary/30 transition-colors hover:bg-primary/60 flex items-center justify-center"
                        onMouseDown={(e) => handleMouseDown(e, "subtitle-start", sub.id)}
                      >
                        <div className="flex flex-col gap-[2px]">
                          <div className="h-px w-1 bg-primary/50" />
                          <div className="h-px w-1 bg-primary/50" />
                          <div className="h-px w-1 bg-primary/50" />
                        </div>
                      </div>
                      <span className="truncate px-3 font-medium">{sub.text}</span>
                      {/* Resize handle right */}
                      <div
                        className="absolute right-0 top-0 h-full w-2 cursor-col-resize rounded-r-md bg-primary/30 transition-colors hover:bg-primary/60 flex items-center justify-center"
                        onMouseDown={(e) => handleMouseDown(e, "subtitle-end", sub.id)}
                      >
                        <div className="flex flex-col gap-[2px]">
                          <div className="h-px w-1 bg-primary/50" />
                          <div className="h-px w-1 bg-primary/50" />
                          <div className="h-px w-1 bg-primary/50" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

          {/* Trim regions */}
          {trimRegions && trimRegions.length > 0 && (
            <>
              {trimRegions.map((trim) => {
                const left = frameToX(trim.startFrame);
                const width = frameToX(trim.endFrame - trim.startFrame);
                const showLabel = width > 40;
                return (
                  <div
                    key={trim.id}
                    className="absolute top-0 z-10 h-full"
                    style={{ left, width: Math.max(width, 8) }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div
                      className="h-full w-full border border-red-500/40 bg-red-500/20"
                      style={{
                        backgroundImage:
                          "repeating-linear-gradient(45deg, transparent, transparent 4px, rgba(239,68,68,0.1) 4px, rgba(239,68,68,0.1) 8px)",
                      }}
                    />
                    {showLabel && (
                      <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] font-medium text-red-400/70 pointer-events-none select-none">
                        Cut
                      </span>
                    )}
                    {onRemoveTrim && (
                      <button
                        className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow-sm transition-transform hover:scale-110"
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveTrim(trim.id);
                        }}
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                    <div
                      className="absolute left-0 top-0 h-full w-2.5 cursor-col-resize bg-red-500/50 transition-colors hover:bg-red-500/70"
                      onMouseDown={(e) => handleMouseDown(e, "trim-start", undefined, trim.id)}
                    />
                    <div
                      className="absolute right-0 top-0 h-full w-2.5 cursor-col-resize bg-red-500/50 transition-colors hover:bg-red-500/70"
                      onMouseDown={(e) => handleMouseDown(e, "trim-end", undefined, trim.id)}
                    />
                  </div>
                );
              })}
            </>
          )}

          {/* Playhead */}
          <div
            ref={playheadRef}
            className="absolute top-0 z-20 h-full cursor-col-resize"
            style={{ left: 0, width: 1 }}
            onMouseDown={(e) => handleMouseDown(e, "playhead")}
          >
            <div className="h-full w-px bg-primary shadow-[0_0_6px_rgba(255,94,58,0.4)]" />
            <div className="absolute -left-1 -top-0.5 h-2.5 w-2.5 rounded-full bg-primary shadow-sm shadow-primary/30" />
          </div>
        </div>
      </div>
    </div>
  );
}
