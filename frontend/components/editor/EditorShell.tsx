"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useProjectStore } from "@/lib/store/project-store";
import { useEditorStore } from "@/lib/store/editor-store";
import { VideoPreview } from "./VideoPreview";
import { Timeline } from "./Timeline";
import { SubtitleEditor } from "./SubtitleEditor";
import { DeviceMockupPicker } from "./DeviceMockupPicker";
import { ExportPanel } from "./ExportPanel";
import { apiFetch } from "@/lib/api-fetch";
import { Button } from "@/components/ui/button";
import {
  Type,
  Monitor,
  Download,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Undo2,
  Redo2,
  Sparkles,
  ZoomIn,
  ZoomOut,
  Clapperboard,
  BookOpen,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { VideoOutline } from "./VideoOutline";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

const SIDEBAR_TABS = [
  { id: "subtitles" as const, label: "Subtitles", icon: Type },
  { id: "outline" as const, label: "Outline", icon: BookOpen },
  { id: "device" as const, label: "Device", icon: Monitor },
  { id: "export" as const, label: "Export", icon: Download },
];

export function EditorShell() {
  const { project, undo, redo, removeTrimRegion, updateTrimRegion, pushHistory } = useProjectStore();
  const {
    sidebarTab,
    setSidebarTab,
    isPlaying,
    setIsPlaying,
    currentFrame,
    setCurrentFrame,
    zoomLevel,
    setZoomLevel,
    isAnalyzing,
  } = useEditorStore();

  const shellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!shellRef.current) return;
    gsap.fromTo(
      shellRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: "power2.out" }
    );
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

      switch (e.key) {
        case " ":
          e.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case "ArrowLeft":
          e.preventDefault();
          setCurrentFrame(Math.max(0, currentFrame - 1));
          break;
        case "ArrowRight":
          e.preventDefault();
          setCurrentFrame(currentFrame + 1);
          break;
        case "z":
          if (e.metaKey || e.ctrlKey) {
            e.preventDefault();
            if (e.shiftKey) redo();
            else undo();
          }
          break;
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPlaying, currentFrame, setIsPlaying, setCurrentFrame, undo, redo]);

  const fps = project.composition.fps;
  const rawFrames = project.video?.durationInFrames;
  const totalFrames = rawFrames && Number.isFinite(rawFrames) && rawFrames > 0 ? Math.round(rawFrames) : 300;
  const currentTime = (currentFrame / fps).toFixed(1);
  const totalTime = (totalFrames / fps).toFixed(1);

  const handleAIAnalyze = async () => {
    if (!project.video) return;
    const { setAnalyzing } = useEditorStore.getState();
    setAnalyzing(true, 0);

    try {
      const { extractFrames } = await import("@/lib/ai/frame-extractor");
      const frames = await extractFrames(project.video.url, 2);

      setAnalyzing(true, 30);

      const res = await apiFetch("/api/analyze-frames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames, fps: project.composition.fps, language: project.language || "en", videoDurationInFrames: project.video.durationInFrames }),
      });

      if (!res.ok) throw new Error("Analysis failed");

      const { subtitles, chapters } = await res.json();
      const { setSubtitles, setChapters } = useProjectStore.getState();
      setSubtitles([...project.subtitles, ...subtitles]);
      if (chapters && chapters.length > 0) {
        setChapters([...(project.chapters ?? []), ...chapters]);
      }

      setAnalyzing(false, 100);
    } catch (err) {
      console.error("AI analysis failed:", err);
      setAnalyzing(false, 0);
    }
  };

  return (
    <div ref={shellRef} className="flex h-screen flex-col bg-background opacity-0">
      {/* Toolbar */}
      <div className="flex h-11 items-center justify-between border-b border-border/60 bg-surface px-4">
        {/* Left — brand + project */}
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clapperboard className="h-3.5 w-3.5 text-muted-foreground/60" />
          <span className="font-display font-bold tracking-tight text-foreground/80">
            ClipDub
          </span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          <Link href="/dashboard" className="transition-colors hover:text-foreground/80">
            Projects
          </Link>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          <span className="max-w-[160px] truncate text-foreground/70">
            {project.name}
          </span>
          <ChevronRight className="h-3 w-3 text-muted-foreground/40" />
          <span className="text-foreground/50">Editor</span>
        </div>

        {/* Center — transport controls */}
        <div className="flex items-center gap-0.5">
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() => setCurrentFrame(0)}
          >
            <SkipBack className="h-3.5 w-3.5" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8 rounded-full"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7"
            onClick={() =>
              setCurrentFrame(Math.min(totalFrames - 1, currentFrame + fps))
            }
          >
            <SkipForward className="h-3.5 w-3.5" />
          </Button>
          <div className="ml-2 flex items-center gap-1 rounded-md bg-muted/50 px-2 py-0.5">
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
              {currentTime}
            </span>
            <span className="text-[10px] text-muted-foreground/40">/</span>
            <span className="font-mono text-[10px] tabular-nums text-muted-foreground/60">
              {totalTime}
            </span>
          </div>
        </div>

        {/* Right — actions */}
        <div className="flex items-center gap-1">
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={undo} title="Undo (Ctrl+Z)">
            <Undo2 className="h-3.5 w-3.5" />
          </Button>
          <Button size="icon" variant="ghost" className="h-7 w-7" onClick={redo} title="Redo (Ctrl+Shift+Z)">
            <Redo2 className="h-3.5 w-3.5" />
          </Button>
          <div className="mx-1.5 h-4 w-px bg-border/40" />
          <Button
            size="sm"
            variant="outline"
            className="h-7 gap-1.5 rounded-full px-3 text-[11px]"
            onClick={handleAIAnalyze}
            disabled={!project.video || isAnalyzing}
          >
            <Sparkles className="h-3 w-3 text-accent" />
            {isAnalyzing ? "Analyzing..." : "AI Analyze"}
          </Button>
          <ThemeToggle className="ml-1 h-7 w-7" />
        </div>
      </div>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="flex w-72 flex-col border-r border-border/50 bg-surface">
          {/* Tabs */}
          <div className="flex border-b border-border/40">
            {SIDEBAR_TABS.map((tab) => (
              <button
                key={tab.id}
                className={`flex flex-1 items-center justify-center gap-1.5 py-2.5 text-[11px] font-medium transition-all ${
                  sidebarTab === tab.id
                    ? "border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground/70"
                }`}
                onClick={() => setSidebarTab(tab.id)}
              >
                <tab.icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-hidden">
            {sidebarTab === "subtitles" && <SubtitleEditor />}
            {sidebarTab === "outline" && <VideoOutline />}
            {sidebarTab === "device" && <DeviceMockupPicker />}
            {sidebarTab === "export" && <ExportPanel />}
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-1 flex-col">
          <div className="flex-1 p-3">
            <VideoPreview />
          </div>

          {/* Timeline zoom bar */}
          <div className="flex items-center gap-2 border-t border-border/40 bg-surface px-4 py-1">
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5"
              onClick={() => setZoomLevel(zoomLevel / 1.5)}
            >
              <ZoomOut className="h-3 w-3" />
            </Button>
            <span className="font-mono text-[9px] tabular-nums text-muted-foreground/60">
              {Math.round(zoomLevel * 100)}%
            </span>
            <Button
              size="icon"
              variant="ghost"
              className="h-5 w-5"
              onClick={() => setZoomLevel(zoomLevel * 1.5)}
            >
              <ZoomIn className="h-3 w-3" />
            </Button>
          </div>

          {/* Timeline */}
          <div className="h-48">
            <Timeline
              trimRegions={project.trimRegions}
              onRemoveTrim={(id) => {
                pushHistory();
                removeTrimRegion(id);
              }}
              onUpdateTrim={(id, updates) => {
                updateTrimRegion(id, updates);
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
