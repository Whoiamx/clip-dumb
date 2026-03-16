"use client";

import { useEffect, useRef, useState } from "react";
import { useWizardStore } from "@/lib/store/wizard-store";
import { useProjectStore } from "@/lib/store/project-store";
import { Loader2, CheckCircle, AlertCircle, Brain } from "lucide-react";
import { apiFetch } from "@/lib/api-fetch";

export function StepAnalysis() {
  const { isAnalyzing, analysisProgress, setAnalyzing, setStep, language } =
    useWizardStore();
  const { project } = useProjectStore();
  const hasStarted = useRef(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (hasStarted.current || !project.video) return;
    hasStarted.current = true;

    const run = async () => {
      setAnalyzing(true, 0);

      try {
        const { extractFrames } = await import("@/lib/ai/frame-extractor");
        setAnalyzing(true, 10);

        const frames = await extractFrames(project.video!.url, 2);
        setAnalyzing(true, 30);

        const res = await apiFetch("/api/analyze-frames", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            frames,
            fps: project.composition.fps,
            language,
            videoDurationInFrames: project.video!.durationInFrames,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Analysis failed");
        }

        setAnalyzing(true, 70);

        const { subtitles, chapters } = await res.json();
        const { setSubtitles, setChapters } = useProjectStore.getState();
        setSubtitles(subtitles);
        if (chapters && chapters.length > 0) {
          setChapters(chapters);
        }

        setAnalyzing(false, 100);

        // Auto-advance after a brief delay
        setTimeout(() => setStep("script"), 1200);
      } catch (err) {
        console.error("AI analysis failed:", err);
        setAnalyzing(false, 0);
        setFailed(true);
      }
    };

    run();
  }, [project.video, project.composition.fps, setAnalyzing, setStep]);

  const progress = analysisProgress;

  const getMessage = () => {
    if (failed) return "Analysis failed";
    if (progress >= 100) return "Script generated!";
    if (progress >= 70) return "Generating script...";
    if (progress >= 30) return "Analyzing with AI...";
    if (progress >= 10) return "Extracting frames...";
    return "Preparing...";
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-12">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        {progress >= 100 ? (
          <CheckCircle className="h-8 w-8 text-emerald-500" />
        ) : failed ? (
          <AlertCircle className="h-8 w-8 text-destructive" />
        ) : (
          <Brain className="h-8 w-8 animate-pulse text-primary" />
        )}
      </div>

      <div className="text-center">
        <h2 className="font-display text-xl font-semibold">{getMessage()}</h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {progress >= 100
            ? "Your narration script is ready for review"
            : failed
              ? "Could not connect to AI service. Please retry."
              : "AI is analyzing your video frames to generate a narration script"}
        </p>
      </div>

      {/* Progress bar */}
      <div className="w-full max-w-sm">
        <div className="h-2 overflow-hidden rounded-full bg-muted/30">
          <div
            className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        {isAnalyzing && (
          <div className="mt-2 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            {Math.round(progress)}%
          </div>
        )}
      </div>

      {/* Retry action */}
      {failed && (
        <button
          onClick={() => {
            setFailed(false);
            hasStarted.current = false;
          }}
          className="text-sm text-muted-foreground hover:text-foreground hover:underline"
        >
          Retry
        </button>
      )}
    </div>
  );
}
