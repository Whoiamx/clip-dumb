"use client";

import { Check } from "lucide-react";
import type { WizardStep } from "@/lib/store/wizard-store";

const ALL_STEPS: { id: WizardStep; label: string }[] = [
  { id: "source", label: "Upload" },
  { id: "settings", label: "Settings" },
  { id: "analysis", label: "AI Analysis" },
  { id: "script", label: "Edit Script" },
  { id: "preview", label: "Preview" },
  { id: "export", label: "Export" },
];

interface StepIndicatorProps {
  currentStep: WizardStep;
  activeSteps?: WizardStep[];
}

export function StepIndicator({ currentStep, activeSteps }: StepIndicatorProps) {
  const steps = activeSteps
    ? ALL_STEPS.filter((s) => activeSteps.includes(s.id))
    : ALL_STEPS;

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-center gap-0">
      {steps.map((step, i) => {
        const isCompleted = i < currentIndex;
        const isActive = i === currentIndex;
        const isFuture = i > currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            {/* Dot */}
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
                {step.label}
              </span>
            </div>

            {/* Connector */}
            {i < steps.length - 1 && (
              <div
                className={`mx-2 mb-5 h-px w-6 sm:w-10 ${
                  isCompleted
                    ? "bg-emerald-500"
                    : isFuture
                      ? "border-t border-dashed border-border/50 bg-transparent"
                      : "bg-primary/30"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
