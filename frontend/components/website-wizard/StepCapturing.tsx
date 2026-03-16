"use client";

import { useEffect, useRef } from "react";
import { Camera, Sparkles, AlertCircle } from "lucide-react";
import { useWebsiteWizardStore } from "@/lib/store/website-wizard-store";
import { apiFetch } from "@/lib/api-fetch";

export function StepCapturing() {
  const {
    url,
    setStep,
    setCaptureData,
    setScript,
    setCapturing,
    setAnalyzing,
    setError,
    isCapturing,
    isAnalyzing,
    error,
  } = useWebsiteWizardStore();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;

    async function run() {
      setCapturing(true);
      setError(null);

      try {
        // Step 1: Capture website
        const captureRes = await apiFetch("/api/website/capture", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: url.startsWith("http") ? url : `https://${url}` }),
        });

        if (!captureRes.ok) {
          const err = await captureRes.json();
          throw new Error(err.error || "Capture failed");
        }

        const captureData = await captureRes.json();
        setCaptureData(captureData);
        setCapturing(false);
        setAnalyzing(true);

        // Step 2: Analyze with AI
        const analyzeRes = await apiFetch("/api/website/analyze", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            captureId: captureData.captureId,
            screenshots: captureData.screenshots,
            metadata: {
              title: captureData.title,
              description: captureData.description,
              brandColors: captureData.brandColors,
            },
          }),
        });

        if (!analyzeRes.ok) {
          const err = await analyzeRes.json();
          throw new Error(err.error || "Analysis failed");
        }

        const script = await analyzeRes.json();
        setScript(script);
        setAnalyzing(false);
        setStep("review-script");
      } catch (err) {
        setCapturing(false);
        setAnalyzing(false);
        setError(err instanceof Error ? err.message : "Something went wrong");
        setStep("url");
      }
    }

    run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col items-center gap-8 pt-16">
      {error ? (
        <>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10">
            <AlertCircle className="h-8 w-8 text-red-500" />
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">Something went wrong</h3>
            <p className="mt-2 text-sm text-muted-foreground">{error}</p>
          </div>
        </>
      ) : (
        <>
          {/* Animated icon */}
          <div className="relative">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
              {isCapturing && <Camera className="h-10 w-10 animate-pulse text-primary" />}
              {isAnalyzing && <Sparkles className="h-10 w-10 animate-pulse text-primary" />}
            </div>
            <div className="absolute -inset-3 animate-ping rounded-2xl bg-primary/5" />
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-foreground">
              {isCapturing ? "Capturing website..." : "Analyzing with AI..."}
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              {isCapturing
                ? "Taking screenshots and extracting metadata from the website."
                : "Generating a showcase video script with scenes and animations."}
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-64">
            <div className="h-1.5 overflow-hidden rounded-full bg-muted/30">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000"
                style={{
                  width: isCapturing ? "40%" : isAnalyzing ? "80%" : "100%",
                }}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
