"use client";

import { useMemo } from "react";
import { Player } from "@remotion/player";
import { useWebsiteWizardStore } from "@/lib/store/website-wizard-store";
import { WebsiteShowcase } from "@/remotion/WebsiteShowcase";
import { API_URL } from "@/lib/config";

export function StepPreview() {
  const { script, captureData } = useWebsiteWizardStore();

  const screenshotUrls = useMemo(() => {
    if (!captureData) return [];
    return captureData.screenshots.map((p) => `${API_URL}/${p.replace(/\\/g, "/")}`);
  }, [captureData]);

  const fullPageUrl = useMemo(() => {
    if (!captureData) return "";
    return `${API_URL}/${captureData.fullPageScreenshot.replace(/\\/g, "/")}`;
  }, [captureData]);

  if (!script) {
    return (
      <div className="flex items-center justify-center py-20 text-sm text-muted-foreground">
        No script available. Go back to generate one.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Preview</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Watch your website showcase video. Use the player controls to scrub through scenes.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/30 bg-black">
        <Player
          component={WebsiteShowcase}
          inputProps={{
            script,
            screenshotUrls,
            fullPageScreenshotUrl: fullPageUrl,
          }}
          durationInFrames={script.totalDurationFrames}
          fps={30}
          compositionWidth={1920}
          compositionHeight={1080}
          style={{ width: "100%" }}
          controls
          autoPlay={false}
        />
      </div>

      {/* Scene breakdown */}
      <div className="grid grid-cols-5 gap-2">
        {script.scenes.map((scene, i) => (
          <div
            key={scene.id}
            className="rounded-lg border border-border/30 bg-surface/50 p-3 text-center"
          >
            <div className="text-xs font-medium text-foreground">{scene.title}</div>
            <div className="mt-0.5 text-xs text-muted-foreground">
              {(scene.durationFrames / 30).toFixed(1)}s
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
