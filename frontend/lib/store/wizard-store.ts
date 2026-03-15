import { create } from "zustand";

export type WizardStep = "source" | "settings" | "analysis" | "script" | "preview" | "export";

interface WizardState {
  step: WizardStep;
  videoFile: File | Blob | null;
  videoSourceType: "upload" | "recording" | null;
  title: string;
  language: string;
  voiceId: string;
  needsSubtitles: boolean;
  isAnalyzing: boolean;
  analysisProgress: number;

  setStep: (step: WizardStep) => void;
  setVideoFile: (file: File | Blob | null, type: "upload" | "recording") => void;
  setTitle: (title: string) => void;
  setLanguage: (language: string) => void;
  setVoiceId: (voiceId: string) => void;
  setNeedsSubtitles: (needs: boolean) => void;
  setAnalyzing: (analyzing: boolean, progress?: number) => void;
  reset: () => void;
}

const initialState = {
  step: "source" as WizardStep,
  videoFile: null as File | Blob | null,
  videoSourceType: null as "upload" | "recording" | null,
  title: "",
  language: "en",
  voiceId: "",
  needsSubtitles: true,
  isAnalyzing: false,
  analysisProgress: 0,
};

export const useWizardStore = create<WizardState>((set) => ({
  ...initialState,

  setStep: (step) => set({ step }),
  setVideoFile: (file, type) => set({ videoFile: file, videoSourceType: type }),
  setTitle: (title) => set({ title }),
  setLanguage: (language) => set({ language }),
  setVoiceId: (voiceId) => set({ voiceId }),
  setNeedsSubtitles: (needs) => set({ needsSubtitles: needs }),
  setAnalyzing: (analyzing, progress) =>
    set({ isAnalyzing: analyzing, analysisProgress: progress ?? 0 }),
  reset: () => set(initialState),
}));
