"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useWebsiteWizardStore, type WebsiteWizardStep } from "@/lib/store/website-wizard-store";
import { StepUrl } from "./StepUrl";
import { StepCapturing } from "./StepCapturing";
import { StepReviewScript } from "./StepReviewScript";
import { StepCustomize } from "./StepCustomize";
import { StepPreview } from "./StepPreview";
import { StepExport } from "./StepExport";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Check } from "lucide-react";
import Link from "next/link";

const STEP_ORDER: WebsiteWizardStep[] = [
  "url",
  "capturing",
  "review-script",
  "customize",
  "preview",
  "export",
];

const STEP_LABELS: Record<WebsiteWizardStep, string> = {
  url: "Website URL",
  capturing: "Capturing",
  "review-script": "Review Script",
  customize: "Customize",
  preview: "Preview",
  export: "Export",
};

export function WebsiteWizardShell() {
  const { step, setStep, url, captureData, script, isCapturing, isAnalyzing } =
    useWebsiteWizardStore();
  const contentRef = useRef<HTMLDivElement>(null);

  const currentIndex = STEP_ORDER.indexOf(step);

  useEffect(() => {
    if (contentRef.current) {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.35, ease: "power2.out" }
      );
    }
  }, [step]);

  const canGoNext = () => {
    switch (step) {
      case "url":
        return url.trim().length > 0;
      case "capturing":
        return false; // Auto-advances
      case "review-script":
        return !!script;
      case "customize":
        return !!script;
      case "preview":
        return true;
      case "export":
        return false;
      default:
        return false;
    }
  };

  const goNext = () => {
    const nextIndex = currentIndex + 1;
    if (nextIndex < STEP_ORDER.length) {
      setStep(STEP_ORDER[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      // Skip "capturing" step when going back
      const targetStep = STEP_ORDER[prevIndex];
      if (targetStep === "capturing") {
        setStep("url");
      } else {
        setStep(targetStep);
      }
    }
  };

  const renderStep = () => {
    switch (step) {
      case "url":
        return <StepUrl />;
      case "capturing":
        return <StepCapturing />;
      case "review-script":
        return <StepReviewScript />;
      case "customize":
        return <StepCustomize />;
      case "preview":
        return <StepPreview />;
      case "export":
        return <StepExport />;
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] flex-col">
      {/* Step indicator */}
      <div className="border-b border-border/30 bg-background/50 px-6 py-5 backdrop-blur-sm">
        <div className="flex items-center justify-center gap-0">
          {STEP_ORDER.map((s, i) => {
            const isCompleted = i < currentIndex;
            const isActive = i === currentIndex;

            return (
              <div key={s} className="flex items-center">
                <div className="flex flex-col items-center gap-1.5">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-all ${
                      isCompleted
                        ? "bg-emerald-500 text-white"
                        : isActive
                          ? "bg-primary text-white shadow-md shadow-primary/20"
                          : "bg-muted/40 text-muted-foreground/50"
                    }`}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : i + 1}
                  </div>
                  <span
                    className={`text-xs transition-all ${
                      isActive
                        ? "font-semibold text-foreground"
                        : isCompleted
                          ? "font-medium text-emerald-500"
                          : "text-muted-foreground/50"
                    }`}
                  >
                    {STEP_LABELS[s]}
                  </span>
                </div>
                {i < STEP_ORDER.length - 1 && (
                  <div
                    className={`mx-2 mb-5 h-px w-6 sm:w-10 ${
                      isCompleted
                        ? "bg-emerald-500"
                        : "border-t border-dashed border-border/50 bg-transparent"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div
          ref={contentRef}
          className={`mx-auto ${step === "preview" ? "max-w-6xl" : "max-w-3xl"}`}
        >
          {renderStep()}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/30 bg-background/80 px-6 py-4 backdrop-blur-sm">
        <div
          className={`mx-auto flex ${step === "preview" ? "max-w-6xl" : "max-w-3xl"} items-center justify-between`}
        >
          <div>
            {currentIndex > 0 && step !== "capturing" ? (
              <Button variant="ghost" className="gap-2" onClick={goBack}>
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            ) : (
              <Button variant="ghost" className="gap-2" asChild>
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            )}
          </div>

          <div>
            {step !== "export" && step !== "capturing" && (
              <Button
                className="gap-2 rounded-full px-6"
                disabled={!canGoNext()}
                onClick={goNext}
              >
                {step === "url" ? "Capture Website" : "Next"}
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
