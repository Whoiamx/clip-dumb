"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/store/project-store";
import { useEditorStore } from "@/lib/store/editor-store";
import { ChevronRight, ChevronDown, Type, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export function VideoOutline() {
  const { project } = useProjectStore();
  const { setCurrentFrame, setSelectedSubtitle, selectedSubtitleId } =
    useEditorStore();
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const chapters = project.chapters ?? [];

  const toggleChapter = (id: string) => {
    setCollapsed((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleChapterClick = (startFrame: number) => {
    setCurrentFrame(startFrame);
  };

  const handleSubtitleClick = (subtitleId: string, startFrame: number) => {
    setSelectedSubtitle(subtitleId);
    setCurrentFrame(startFrame);
  };

  // Find subtitles not in any chapter
  const assignedIds = new Set(chapters.flatMap((ch) => ch.subtitleIds));
  const unassigned = project.subtitles.filter((s) => !assignedIds.has(s.id));

  if (chapters.length === 0 && project.subtitles.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 p-4">
        <BookOpen className="h-6 w-6 text-muted-foreground/30" />
        <p className="text-center text-xs text-muted-foreground/50">
          No outline yet. Run AI Analyze to generate chapters.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-1 overflow-y-auto p-3">
      <h3 className="mb-2 font-display text-sm font-semibold">Outline</h3>

      {chapters.map((chapter) => {
        const isCollapsed = collapsed[chapter.id];
        const chapterSubs = chapter.subtitleIds
          .map((id) => project.subtitles.find((s) => s.id === id))
          .filter(Boolean);

        return (
          <div key={chapter.id} className="mb-1">
            {/* Chapter header */}
            <button
              onClick={() => {
                toggleChapter(chapter.id);
                handleChapterClick(chapter.startFrame);
              }}
              className="flex w-full items-center gap-1.5 rounded-lg px-2 py-1.5 text-left text-xs font-semibold text-foreground/80 transition-all hover:bg-muted/50"
            >
              {isCollapsed ? (
                <ChevronRight className="h-3 w-3 shrink-0 text-muted-foreground/60" />
              ) : (
                <ChevronDown className="h-3 w-3 shrink-0 text-muted-foreground/60" />
              )}
              <span className="truncate">{chapter.title}</span>
              <span className="ml-auto font-mono text-[10px] font-normal text-muted-foreground/40">
                {chapterSubs.length}
              </span>
            </button>

            {/* Subtitles */}
            {!isCollapsed && (
              <div className="ml-3 flex flex-col gap-0.5 border-l border-border/30 pl-2">
                {chapterSubs.map((sub) =>
                  sub ? (
                    <button
                      key={sub.id}
                      onClick={() =>
                        handleSubtitleClick(sub.id, sub.startFrame)
                      }
                      className={cn(
                        "flex items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] transition-all",
                        sub.id === selectedSubtitleId
                          ? "bg-primary/15 text-foreground"
                          : "text-muted-foreground hover:bg-muted/40 hover:text-foreground/80"
                      )}
                    >
                      <Type className="h-2.5 w-2.5 shrink-0 opacity-40" />
                      <span className="truncate">{sub.text}</span>
                    </button>
                  ) : null
                )}
              </div>
            )}
          </div>
        );
      })}

      {/* Unassigned subtitles */}
      {unassigned.length > 0 && (
        <div className="mt-2">
          <div className="px-2 py-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/40">
            Uncategorized
          </div>
          <div className="flex flex-col gap-0.5">
            {unassigned.map((sub) => (
              <button
                key={sub.id}
                onClick={() => handleSubtitleClick(sub.id, sub.startFrame)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2 py-1 text-left text-[11px] transition-all",
                  sub.id === selectedSubtitleId
                    ? "bg-primary/15 text-foreground"
                    : "text-muted-foreground hover:bg-muted/40 hover:text-foreground/80"
                )}
              >
                <Type className="h-2.5 w-2.5 shrink-0 opacity-40" />
                <span className="truncate">{sub.text}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
