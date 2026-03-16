"use client";

import { useState } from "react";
import { Download, Check, Loader2 } from "lucide-react";
import { useWebsiteWizardStore } from "@/lib/store/website-wizard-store";
import { Button } from "@/components/ui/button";

const QUALITY_OPTIONS = [
  { value: "720p", label: "720p", description: "HD — Fast render" },
  { value: "1080p", label: "1080p", description: "Full HD — Recommended" },
  { value: "4k", label: "4K", description: "Ultra HD — Slow render" },
] as const;

export function StepExport() {
  const { script } = useWebsiteWizardStore();
  const [quality, setQuality] = useState<"720p" | "1080p" | "4k">("1080p");
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);

  if (!script) return null;

  const handleExport = async () => {
    setExporting(true);
    setProgress(0);

    // Simulated progress (real Remotion render pending)
    const interval = setInterval(() => {
      setProgress((p) => {
        if (p >= 95) {
          clearInterval(interval);
          return 95;
        }
        return p + Math.random() * 8 + 2;
      });
    }, 500);

    // Simulate render completion
    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setExporting(false);
      setDone(true);
    }, 6000);
  };

  return (
    <div className="flex flex-col items-center gap-8 pt-8">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        {done ? (
          <Check className="h-8 w-8 text-emerald-500" />
        ) : (
          <Download className="h-8 w-8 text-primary" />
        )}
      </div>

      <div className="text-center">
        <h2 className="text-xl font-bold text-foreground">
          {done ? "Export Complete!" : "Export Video"}
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {done
            ? "Your website showcase video is ready."
            : `${script.scenes.length} scenes — ${(script.totalDurationFrames / 30).toFixed(0)}s total`}
        </p>
      </div>

      {/* Quality selector */}
      {!exporting && !done && (
        <div className="flex gap-3">
          {QUALITY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setQuality(opt.value)}
              className={`rounded-xl border px-6 py-3 text-center transition-all ${
                quality === opt.value
                  ? "border-primary bg-primary/5"
                  : "border-border/40 hover:border-border"
              }`}
            >
              <div className="text-lg font-bold text-foreground">{opt.label}</div>
              <div className="text-xs text-muted-foreground">{opt.description}</div>
            </button>
          ))}
        </div>
      )}

      {/* Progress */}
      {exporting && (
        <div className="w-80">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Rendering...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted/30">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Export button */}
      {!done && (
        <Button
          className="gap-2 rounded-full px-8"
          disabled={exporting}
          onClick={handleExport}
        >
          {exporting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Rendering...
            </>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export {quality}
            </>
          )}
        </Button>
      )}

      {done && (
        <p className="text-xs text-muted-foreground">
          Real MP4 export via Remotion is coming soon. This is a simulated render.
        </p>
      )}
    </div>
  );
}
