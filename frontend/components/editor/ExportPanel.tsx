"use client";

import { useState } from "react";
import { useProjectStore } from "@/lib/store/project-store";
import { useEditorStore } from "@/lib/store/editor-store";
import { Button } from "@/components/ui/button";
import { Download, Loader2, CheckCircle, Film } from "lucide-react";
import type { ExportSettings } from "@/lib/types/project";
import { apiFetch } from "@/lib/api-fetch";

const QUALITY_PRESETS: {
  value: ExportSettings["quality"];
  label: string;
  resolution: string;
}[] = [
  { value: "720p", label: "Draft", resolution: "1280x720" },
  { value: "1080p", label: "HD", resolution: "1920x1080" },
  { value: "4k", label: "4K", resolution: "3840x2160" },
];

export function ExportPanel() {
  const { project, updateExportSettings } = useProjectStore();
  const { isExporting, exportProgress, setExporting } = useEditorStore();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  const handleExport = async () => {
    setExporting(true, 0);
    setDownloadUrl(null);

    try {
      const res = await apiFetch("/api/render", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project: project,
          exportSettings: project.exportSettings,
        }),
      });

      if (!res.ok) throw new Error("Render failed to start");

      const { renderId } = await res.json();

      const poll = async () => {
        const statusRes = await apiFetch(
          `/api/render-status?id=${encodeURIComponent(renderId)}`
        );
        const status = await statusRes.json();

        if (status.done) {
          setExporting(false, 100);
          setDownloadUrl(status.url);
          return;
        }

        if (status.error) {
          throw new Error(status.error);
        }

        setExporting(true, status.progress || 0);
        setTimeout(poll, 2000);
      };

      await poll();
    } catch (err) {
      console.error("Export failed:", err);
      setExporting(false, 0);
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      <h3 className="font-display text-sm font-semibold">Export Video</h3>

      {/* Quality */}
      <div>
        <label className="mb-2 block font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
          Quality
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          {QUALITY_PRESETS.map((preset) => (
            <button
              key={preset.value}
              className={`flex flex-col items-center rounded-xl px-3 py-2.5 transition-all ${
                project.exportSettings.quality === preset.value
                  ? "bg-primary text-white shadow-sm shadow-primary/20"
                  : "bg-muted/30 text-muted-foreground hover:bg-muted/50 hover:text-foreground/80"
              }`}
              onClick={() => updateExportSettings({ quality: preset.value })}
            >
              <span className="text-[11px] font-semibold">{preset.label}</span>
              <span className="font-mono text-[9px] opacity-60">
                {preset.resolution}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Progress */}
      {isExporting && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Rendering...</span>
            <span className="ml-auto font-mono text-xs text-primary">
              {Math.round(exportProgress)}%
            </span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-border/40">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${exportProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Download */}
      {downloadUrl && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
            <CheckCircle className="h-4 w-4" />
            Render complete!
          </div>
          <a
            href={downloadUrl}
            download
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
          >
            <Download className="h-4 w-4" />
            Download MP4
          </a>
        </div>
      )}

      <Button
        className="mt-auto rounded-xl"
        disabled={isExporting || !project.video}
        onClick={handleExport}
      >
        {isExporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Film className="h-4 w-4" />
        )}
        {isExporting ? "Rendering..." : "Export MP4"}
      </Button>

      <p className="font-mono text-[9px] leading-relaxed text-muted-foreground/40">
        Server-side rendering may take a few minutes depending on video length
        and quality settings.
      </p>
    </div>
  );
}
