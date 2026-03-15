"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useWizardStore, type WizardStep } from "@/lib/store/wizard-store";
import { useProjectStore } from "@/lib/store/project-store";
import { StepIndicator } from "./StepIndicator";
import { StepSource } from "./StepSource";
import { StepSettings } from "./StepSettings";
import { StepAnalysis } from "./StepAnalysis";
import { StepScript } from "./StepScript";
import { StepExport } from "./StepExport";
import { StepPreview } from "./StepPreview";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const STEP_ORDER: WizardStep[] = [
  "source",
  "settings",
  "analysis",
  "script",
  "preview",
  "export",
];

export function WizardShell() {
  const { step, setStep, videoFile, title, voiceId, needsSubtitles } = useWizardStore();
  const { project } = useProjectStore();
  const contentRef = useRef<HTMLDivElement>(null);

  const activeSteps = needsSubtitles
    ? STEP_ORDER
    : STEP_ORDER.filter((s) => s !== "analysis" && s !== "script" && s !== "preview");

  const currentIndex = activeSteps.indexOf(step);

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
      case "source":
        return !!videoFile && !!project.video;
      case "settings":
        return title.trim().length > 0 && (!needsSubtitles || voiceId.length > 0);
      case "analysis":
        return !useWizardStore.getState().isAnalyzing;
      case "script":
        return true;
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
    if (nextIndex < activeSteps.length) {
      setStep(activeSteps[nextIndex]);
    }
  };

  const goBack = () => {
    const prevIndex = currentIndex - 1;
    if (prevIndex >= 0) {
      setStep(activeSteps[prevIndex]);
    }
  };

  const getNextLabel = () => {
    switch (step) {
      case "settings":
        return needsSubtitles ? "Start Analysis" : "Continue to Export";
      case "script":
        return "Preview & Edit";
      case "preview":
        return "Continue to Export";
      default:
        return "Next";
    }
  };

  const renderStep = () => {
    switch (step) {
      case "source":
        return <StepSource />;
      case "settings":
        return <StepSettings />;
      case "analysis":
        return <StepAnalysis />;
      case "script":
        return <StepScript />;
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
        <StepIndicator currentStep={step} activeSteps={activeSteps} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div ref={contentRef} className={`mx-auto ${step === "preview" ? "max-w-6xl" : "max-w-3xl"}`}>
          {renderStep()}
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-border/30 bg-background/80 px-6 py-4 backdrop-blur-sm">
        <div className={`mx-auto flex ${step === "preview" ? "max-w-6xl" : "max-w-3xl"} items-center justify-between`}>
          <div>
            {currentIndex > 0 ? (
              <Button
                variant="ghost"
                className="gap-2"
                onClick={goBack}
              >
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
            {step !== "export" && step !== "analysis" && (
              <Button
                className="gap-2 rounded-full px-6"
                disabled={!canGoNext()}
                onClick={goNext}
              >
                {step === "settings" && needsSubtitles && <Sparkles className="h-4 w-4" />}
                {getNextLabel()}
                {step !== "settings" && <ArrowRight className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
