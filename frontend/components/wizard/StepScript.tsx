"use client";

import { useProjectStore } from "@/lib/store/project-store";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, ChevronRight, ChevronDown, BookOpen, Download, GripVertical } from "lucide-react";
import { useState, useCallback } from "react";
import { Reorder } from "framer-motion";
import type { SubtitleEntry } from "@/lib/types/project";

export function StepScript() {
  const {
    project,
    updateSubtitle,
    removeSubtitle,
    addSubtitle,
    setSubtitles,
    setChapters,
    pushHistory,
  } = useProjectStore();
  const [collapsedChapters, setCollapsedChapters] = useState<Record<string, boolean>>({});

  const chapters = project.chapters ?? [];
  const assignedIds = new Set(chapters.flatMap((ch) => ch.subtitleIds));
  const unassigned = project.subtitles.filter((s) => !assignedIds.has(s.id));
  const hasChapters = chapters.length > 0;

  const fps = project.composition.fps;
  const videoDuration = project.video?.durationInFrames ?? Infinity;
  const isFiniteDuration = isFinite(videoDuration);

  // Coverage indicator
  const subtitleCount = project.subtitles.length;
  const firstStart = subtitleCount > 0 ? Math.min(...project.subtitles.map((s) => s.startFrame)) : 0;
  const lastEnd = subtitleCount > 0 ? Math.max(...project.subtitles.map((s) => s.endFrame)) : 0;

  // Add Step: place after last subtitle with a small gap
  const lastSub = project.subtitles[project.subtitles.length - 1];
  const nextStart = lastSub ? lastSub.endFrame + Math.round(fps * 0.5) : 0;
  // Only disable if there's no room for at least 1 second after the furthest subtitle
  const addDisabled = isFiniteDuration && (videoDuration - lastEnd) < fps;

  const formatTime = (frame: number) => {
    const seconds = frame / fps;
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const parseTime = (timeStr: string): number | null => {
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const minutes = parseInt(match[1], 10);
    const seconds = parseInt(match[2], 10);
    if (seconds >= 60) return null;
    return Math.round((minutes * 60 + seconds) * fps);
  };

  const formatSrtTime = (frame: number) => {
    const totalSeconds = frame / fps;
    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    const s = Math.floor(totalSeconds % 60);
    const ms = Math.round((totalSeconds % 1) * 1000);
    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")},${ms.toString().padStart(3, "0")}`;
  };

  const downloadScript = () => {
    const srt = project.subtitles
      .map((sub, i) => `${i + 1}\n${formatSrtTime(sub.startFrame)} --> ${formatSrtTime(sub.endFrame)}\n${sub.text}\n`)
      .join("\n");
    const blob = new Blob([srt], { type: "text/srt" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${project.name || "script"}.srt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const toggleChapter = (id: string) => {
    setCollapsedChapters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddStep = useCallback(() => {
    if (addDisabled) return;
    pushHistory();
    // If nextStart (with gap) exceeds video, try placing right after last subtitle without gap
    let start = nextStart;
    if (isFiniteDuration && start >= videoDuration && lastSub) {
      start = lastSub.endFrame;
    }
    const desiredDuration = fps * 3;
    const minDuration = fps; // at least 1 second
    const maxEnd = isFiniteDuration ? videoDuration : start + desiredDuration;
    const newEnd = Math.min(start + desiredDuration, maxEnd);
    // If we can't fit even 1 second, don't add
    if (newEnd - start < minDuration && isFiniteDuration) return;
    addSubtitle({ text: "New step", source: "manual", startFrame: start, endFrame: newEnd });
  }, [addDisabled, pushHistory, nextStart, lastSub, fps, videoDuration, isFiniteDuration, addSubtitle]);

  const handleRemove = useCallback(
    (id: string) => {
      pushHistory();
      removeSubtitle(id);
    },
    [pushHistory, removeSubtitle]
  );

  const handleStartBlur = useCallback(
    (sub: SubtitleEntry, e: React.FocusEvent<HTMLInputElement>) => {
      const parsed = parseTime(e.target.value);
      if (
        parsed !== null &&
        parsed >= 0 &&
        parsed < sub.endFrame &&
        (!isFiniteDuration || parsed < videoDuration)
      ) {
        pushHistory();
        updateSubtitle(sub.id, { startFrame: parsed });
      } else {
        e.target.value = formatTime(sub.startFrame);
      }
    },
    [pushHistory, updateSubtitle, videoDuration, isFiniteDuration, fps]
  );

  const handleEndBlur = useCallback(
    (sub: SubtitleEntry, e: React.FocusEvent<HTMLInputElement>) => {
      const parsed = parseTime(e.target.value);
      if (
        parsed !== null &&
        parsed > sub.startFrame &&
        (!isFiniteDuration || parsed <= videoDuration)
      ) {
        pushHistory();
        updateSubtitle(sub.id, { endFrame: parsed });
      } else {
        e.target.value = formatTime(sub.endFrame);
      }
    },
    [pushHistory, updateSubtitle, videoDuration, isFiniteDuration, fps]
  );

  const handleTextFocus = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  const handleReorder = useCallback(
    (newOrder: SubtitleEntry[]) => {
      pushHistory();

      const gap = Math.round(fps * 0.5);
      let currentFrame = 0;
      const reordered = newOrder.map((sub) => {
        const duration = sub.endFrame - sub.startFrame;
        const startFrame = currentFrame;
        const endFrame = isFiniteDuration
          ? Math.min(currentFrame + duration, videoDuration)
          : currentFrame + duration;
        currentFrame = endFrame + gap;
        return { ...sub, startFrame, endFrame };
      });

      setSubtitles(reordered);

      // Rebuild chapter subtitleIds based on new order
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
    [pushHistory, fps, videoDuration, isFiniteDuration, setSubtitles, chapters, setChapters]
  );

  const renderSubtitle = (sub: SubtitleEntry, i: number, isDraggable?: boolean) => {
    const inner = (
      <>
        {isDraggable && (
          <div className="flex cursor-grab items-center self-stretch text-muted-foreground/30 active:cursor-grabbing">
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        <div className="flex flex-col items-center gap-1 pt-1">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-semibold text-primary">
            {i + 1}
          </span>
          <input
            key={`${sub.id}-start-${sub.startFrame}`}
            defaultValue={formatTime(sub.startFrame)}
            onBlur={(e) => handleStartBlur(sub, e)}
            className="w-[42px] bg-transparent text-center font-mono text-[10px] text-muted-foreground/50 outline-none focus:text-foreground"
          />
          <input
            key={`${sub.id}-end-${sub.endFrame}`}
            defaultValue={formatTime(sub.endFrame)}
            onBlur={(e) => handleEndBlur(sub, e)}
            className="w-[42px] bg-transparent text-center font-mono text-[10px] text-muted-foreground/50 outline-none focus:text-foreground"
          />
        </div>
        <textarea
          value={sub.text}
          onFocus={handleTextFocus}
          onChange={(e) => updateSubtitle(sub.id, { text: e.target.value })}
          rows={2}
          className="flex-1 resize-none rounded-lg border-0 bg-transparent text-sm outline-none placeholder:text-muted-foreground/40"
        />
        <button
          onClick={() => handleRemove(sub.id)}
          className="self-start rounded-lg p-1.5 text-muted-foreground/40 opacity-0 transition-all hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </>
    );

    if (isDraggable) {
      return (
        <Reorder.Item
          key={sub.id}
          value={sub}
          className="group flex gap-3 rounded-xl border border-border/40 bg-card/20 p-3 transition-all hover:border-border/60"
        >
          {inner}
        </Reorder.Item>
      );
    }

    return (
      <div
        key={sub.id}
        className="group flex gap-3 rounded-xl border border-border/40 bg-card/20 p-3 transition-all hover:border-border/60"
      >
        {inner}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-display text-xl font-semibold">
          Edit your script
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Review and edit the AI-generated narration. Each entry becomes a
          subtitle with voiceover.
        </p>
      </div>

      <div className="flex gap-6">
        {/* Outline sidebar (only when chapters exist) */}
        {hasChapters && (
          <div className="hidden w-48 flex-shrink-0 md:block">
            <div className="sticky top-4 rounded-xl border border-border/40 bg-card/10 p-3">
              <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground/70">
                <BookOpen className="h-3.5 w-3.5" />
                Outline
              </div>
              {chapters.map((ch) => (
                <button
                  key={ch.id}
                  onClick={() => toggleChapter(ch.id)}
                  className="flex w-full items-center gap-1 rounded-md px-2 py-1 text-left text-[11px] text-muted-foreground transition-all hover:bg-muted/40 hover:text-foreground/80"
                >
                  {collapsedChapters[ch.id] ? (
                    <ChevronRight className="h-2.5 w-2.5 shrink-0" />
                  ) : (
                    <ChevronDown className="h-2.5 w-2.5 shrink-0" />
                  )}
                  <span className="truncate">{ch.title}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Subtitle list */}
        <div className="flex flex-1 flex-col gap-3">
          {/* Coverage indicator */}
          {subtitleCount > 0 && (
            <div className="text-xs text-muted-foreground/60">
              {subtitleCount} step{subtitleCount !== 1 ? "s" : ""} · {formatTime(firstStart)} – {formatTime(lastEnd)}
              {isFiniteDuration && ` / ${formatTime(videoDuration)}`}
            </div>
          )}

          {project.subtitles.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/50 p-8 text-center text-sm text-muted-foreground">
              No script entries yet. Add one manually or go back to run AI
              analysis.
            </div>
          ) : hasChapters ? (
            <>
              {chapters.map((chapter) => {
                const chapterSubs = chapter.subtitleIds
                  .map((id) => project.subtitles.find((s) => s.id === id))
                  .filter(Boolean) as SubtitleEntry[];
                const isCollapsed = collapsedChapters[chapter.id];

                return (
                  <div key={chapter.id}>
                    <button
                      onClick={() => toggleChapter(chapter.id)}
                      className="mb-2 flex items-center gap-1.5 text-xs font-semibold text-foreground/70"
                    >
                      {isCollapsed ? (
                        <ChevronRight className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )}
                      {chapter.title}
                      <span className="font-mono text-[10px] font-normal text-muted-foreground/40">
                        ({chapterSubs.length})
                      </span>
                    </button>
                    {!isCollapsed && (
                      <div className="flex flex-col gap-3">
                        {chapterSubs.map((sub, i) => renderSubtitle(sub, i, false))}
                      </div>
                    )}
                  </div>
                );
              })}
              {unassigned.length > 0 && (
                <div>
                  <div className="mb-2 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
                    Uncategorized
                  </div>
                  <div className="flex flex-col gap-3">
                    {unassigned.map((sub, i) => renderSubtitle(sub, i, false))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <Reorder.Group
              axis="y"
              values={project.subtitles}
              onReorder={handleReorder}
              className="flex flex-col gap-3"
            >
              {project.subtitles.map((sub, i) => renderSubtitle(sub, i, true))}
            </Reorder.Group>
          )}

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 rounded-full"
              onClick={handleAddStep}
              disabled={addDisabled}
              title={addDisabled ? "No more space in the video" : undefined}
            >
              <Plus className="h-3.5 w-3.5" />
              Add Step
            </Button>
            {project.subtitles.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                className="gap-2 rounded-full"
                onClick={downloadScript}
              >
                <Download className="h-3.5 w-3.5" />
                Download Script
              </Button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
