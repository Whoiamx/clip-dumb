"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useProjectStore } from "@/lib/store/project-store";
import { useWizardStore } from "@/lib/store/wizard-store";
import { useEditorStore } from "@/lib/store/editor-store";
import { saveProject } from "@/lib/db/projects";
import { VideoPreview } from "@/components/editor/VideoPreview";
import { Button } from "@/components/ui/button";
import {
  Download,
  Loader2,
  CheckCircle,
  Film,
  Save,
} from "lucide-react";
import type { ExportSettings } from "@/lib/types/project";
import { API_URL } from "@/lib/config";

const QUALITY_PRESETS: {
  value: ExportSettings["quality"];
  label: string;
  resolution: string;
}[] = [
  { value: "720p", label: "Draft", resolution: "1280×720" },
  { value: "1080p", label: "HD", resolution: "1920×1080" },
  { value: "4k", label: "4K", resolution: "3840×2160" },
];

export function StepExport() {
  const router = useRouter();
  const { project, updateExportSettings, updateName } = useProjectStore();
  const { title, language, voiceId, reset } = useWizardStore();
  const { isExporting, exportProgress, setExporting } = useEditorStore();
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const handleExport = async () => {
    setExporting(true, 0);
    setDownloadUrl(null);

    try {
      const res = await fetch(`${API_URL}/api/render`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          project,
          exportSettings: project.exportSettings,
        }),
      });

      if (!res.ok) throw new Error("Render failed to start");

      const { renderId } = await res.json();

      const poll = async () => {
        const statusRes = await fetch(
          `${API_URL}/api/render-status?id=${encodeURIComponent(renderId)}`
        );
        const status = await statusRes.json();

        if (status.done) {
          setExporting(false, 100);
          setDownloadUrl(status.url);
          return;
        }

        if (status.error) throw new Error(status.error);

        setExporting(true, status.progress || 0);
        setTimeout(poll, 2000);
      };

      await poll();
    } catch (err) {
      console.error("Export failed:", err);
      setExporting(false, 0);
    }
  };

  const handleSaveAndDashboard = async () => {
    setSaving(true);
    if (title) updateName(title);

    const currentProject = useProjectStore.getState().project;
    const finalProject = {
      ...currentProject,
      name: title || currentProject.name,
      language,
      voiceId,
    };

    await saveProject(finalProject);
    reset();
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-display text-xl font-semibold">
          Export your tutorial
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Choose quality and export, or save to come back later
        </p>
      </div>

      {/* Preview */}
      <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-xl border border-border/40 bg-black">
        <VideoPreview />
      </div>

      <div className="mx-auto w-full max-w-md flex flex-col gap-6">
        {/* Quality */}
        <div>
          <label className="mb-2 block text-sm font-medium">Quality</label>
          <div className="grid grid-cols-3 gap-2">
            {QUALITY_PRESETS.map((preset) => (
              <button
                key={preset.value}
                className={`flex flex-col items-center rounded-xl px-3 py-3 transition-all ${
                  project.exportSettings.quality === preset.value
                    ? "bg-primary text-white shadow-sm shadow-primary/20"
                    : "bg-muted/30 text-muted-foreground hover:bg-muted/50"
                }`}
                onClick={() =>
                  updateExportSettings({ quality: preset.value })
                }
              >
                <span className="text-sm font-semibold">{preset.label}</span>
                <span className="font-mono text-[10px] opacity-60">
                  {preset.resolution}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Export progress */}
        {isExporting && (
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
              <span>Rendering...</span>
              <span className="ml-auto font-mono text-xs text-primary">
                {Math.round(exportProgress)}%
              </span>
            </div>
            <div className="h-1.5 overflow-hidden rounded-full bg-border/40">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${exportProgress}%` }}
              />
            </div>
          </div>
        )}

        {downloadUrl && (
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-emerald-400">
              <CheckCircle className="h-4 w-4" />
              Render complete!
            </div>
            <a
              href={downloadUrl}
              download
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700"
            >
              <Download className="h-4 w-4" />
              Download MP4
            </a>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col gap-3">
          <Button
            className="gap-2 rounded-xl"
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

          <Button
            variant="outline"
            className="gap-2 rounded-xl"
            onClick={handleSaveAndDashboard}
            disabled={saving}
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save & Go to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
}
