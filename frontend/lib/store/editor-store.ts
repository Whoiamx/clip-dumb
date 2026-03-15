import { create } from "zustand";

interface EditorState {
  // Playback
  currentFrame: number;
  isPlaying: boolean;

  // Selection
  selectedSubtitleId: string | null;

  // Timeline
  zoomLevel: number;
  scrollOffset: number;

  // Panels
  sidebarTab: "subtitles" | "outline" | "style" | "device" | "export";

  // AI
  isAnalyzing: boolean;
  analysisProgress: number;

  // Export
  isExporting: boolean;
  exportProgress: number;

  // Actions
  setCurrentFrame: (frame: number) => void;
  setIsPlaying: (playing: boolean) => void;
  setSelectedSubtitle: (id: string | null) => void;
  setZoomLevel: (zoom: number) => void;
  setScrollOffset: (offset: number) => void;
  setSidebarTab: (tab: EditorState["sidebarTab"]) => void;
  setAnalyzing: (analyzing: boolean, progress?: number) => void;
  setExporting: (exporting: boolean, progress?: number) => void;
}

export const useEditorStore = create<EditorState>((set) => ({
  currentFrame: 0,
  isPlaying: false,
  selectedSubtitleId: null,
  zoomLevel: 1,
  scrollOffset: 0,
  sidebarTab: "subtitles",
  isAnalyzing: false,
  analysisProgress: 0,
  isExporting: false,
  exportProgress: 0,

  setCurrentFrame: (frame) => set({ currentFrame: frame }),
  setIsPlaying: (playing) => set({ isPlaying: playing }),
  setSelectedSubtitle: (id) => set({ selectedSubtitleId: id }),
  setZoomLevel: (zoom) => set({ zoomLevel: Math.max(0.1, Math.min(10, zoom)) }),
  setScrollOffset: (offset) => set({ scrollOffset: offset }),
  setSidebarTab: (tab) => set({ sidebarTab: tab }),
  setAnalyzing: (analyzing, progress) =>
    set({ isAnalyzing: analyzing, analysisProgress: progress ?? 0 }),
  setExporting: (exporting, progress) =>
    set({ isExporting: exporting, exportProgress: progress ?? 0 }),
}));
