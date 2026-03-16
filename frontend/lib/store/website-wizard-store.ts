import { create } from "zustand";
import type { CaptureResult, WebsiteShowcaseScript } from "@/lib/types/website-showcase";

export type WebsiteWizardStep =
  | "url"
  | "capturing"
  | "review-script"
  | "customize"
  | "preview"
  | "export";

interface WebsiteWizardState {
  step: WebsiteWizardStep;
  url: string;
  captureData: CaptureResult | null;
  script: WebsiteShowcaseScript | null;
  isCapturing: boolean;
  isAnalyzing: boolean;
  error: string | null;

  setStep: (step: WebsiteWizardStep) => void;
  setUrl: (url: string) => void;
  setCaptureData: (data: CaptureResult) => void;
  setScript: (script: WebsiteShowcaseScript) => void;
  updateScript: (updater: (script: WebsiteShowcaseScript) => WebsiteShowcaseScript) => void;
  setCapturing: (capturing: boolean) => void;
  setAnalyzing: (analyzing: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  step: "url" as WebsiteWizardStep,
  url: "",
  captureData: null as CaptureResult | null,
  script: null as WebsiteShowcaseScript | null,
  isCapturing: false,
  isAnalyzing: false,
  error: null as string | null,
};

export const useWebsiteWizardStore = create<WebsiteWizardState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setUrl: (url) => set({ url }),
  setCaptureData: (data) => set({ captureData: data }),
  setScript: (script) => set({ script }),
  updateScript: (updater) =>
    set((state) => ({
      script: state.script ? updater(state.script) : null,
    })),
  setCapturing: (capturing) => set({ isCapturing: capturing }),
  setAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
  setError: (error) => set({ error }),
  reset: () => set(initialState),
}));
