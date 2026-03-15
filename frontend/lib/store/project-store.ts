import { create } from "zustand";
import { nanoid } from "nanoid";
import type {
  Project,
  SubtitleEntry,
  Chapter,
  TrimRegion,
  CompositionSettings,
  VideoSource,
  ExportSettings,
  SubtitleStyle,
} from "@/lib/types/project";
import {
  DEFAULT_COMPOSITION,
  DEFAULT_EXPORT,
  DEFAULT_SUBTITLE_STYLE,
} from "@/lib/types/project";

interface ProjectState {
  project: Project;
  history: Project[];
  historyIndex: number;

  // Project actions
  setProject: (project: Project) => void;
  updateName: (name: string) => void;
  setVideo: (video: VideoSource) => void;

  // Subtitle actions
  addSubtitle: (partial?: Partial<SubtitleEntry>) => SubtitleEntry;
  updateSubtitle: (id: string, updates: Partial<SubtitleEntry>) => void;
  removeSubtitle: (id: string) => void;
  setSubtitles: (subtitles: SubtitleEntry[]) => void;

  // Chapter actions
  setChapters: (chapters: Chapter[]) => void;
  addChapter: (partial?: Partial<Chapter>) => Chapter;
  updateChapter: (id: string, updates: Partial<Chapter>) => void;
  removeChapter: (id: string) => void;

  // Trim region actions
  addTrimRegion: (partial?: Partial<TrimRegion>) => TrimRegion;
  updateTrimRegion: (id: string, updates: Partial<TrimRegion>) => void;
  removeTrimRegion: (id: string) => void;

  // Composition actions
  updateComposition: (updates: Partial<CompositionSettings>) => void;
  updateExportSettings: (updates: Partial<ExportSettings>) => void;

  // History
  undo: () => void;
  redo: () => void;
  pushHistory: () => void;
}

function createDefaultProject(): Project {
  return {
    id: nanoid(),
    name: "Untitled Project",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    video: null,
    composition: { ...DEFAULT_COMPOSITION },
    subtitles: [],
    chapters: [],
    exportSettings: { ...DEFAULT_EXPORT },
  };
}

export const useProjectStore = create<ProjectState>((set, get) => ({
  project: createDefaultProject(),
  history: [],
  historyIndex: -1,

  setProject: (project) => set({ project, history: [], historyIndex: -1 }),

  updateName: (name) =>
    set((s) => ({
      project: { ...s.project, name, updatedAt: Date.now() },
    })),

  setVideo: (video) =>
    set((s) => ({
      project: {
        ...s.project,
        video,
        updatedAt: Date.now(),
        composition: {
          ...s.project.composition,
          width: video.width > 0 ? (video.width < 1920 ? 1920 : video.width) : 1920,
          height: video.height > 0 ? (video.height < 1080 ? 1080 : video.height) : 1080,
        },
      },
    })),

  addSubtitle: (partial) => {
    const { project } = get();
    const fps = project.composition.fps;
    const subtitle: SubtitleEntry = {
      id: nanoid(),
      text: "New subtitle",
      startFrame: 0,
      endFrame: fps * 3,
      position: { x: 0.5, y: 0.85 },
      style: { ...DEFAULT_SUBTITLE_STYLE },
      animation: "fade",
      source: "manual",
      ...partial,
    };
    set((s) => ({
      project: {
        ...s.project,
        subtitles: [...s.project.subtitles, subtitle],
        updatedAt: Date.now(),
      },
    }));
    return subtitle;
  },

  updateSubtitle: (id, updates) =>
    set((s) => ({
      project: {
        ...s.project,
        subtitles: s.project.subtitles.map((sub) =>
          sub.id === id ? { ...sub, ...updates } : sub
        ),
        updatedAt: Date.now(),
      },
    })),

  removeSubtitle: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        subtitles: s.project.subtitles.filter((sub) => sub.id !== id),
        chapters: (s.project.chapters ?? [])
          .map((ch) => ({
            ...ch,
            subtitleIds: ch.subtitleIds.filter((sid) => sid !== id),
          }))
          .filter((ch) => ch.subtitleIds.length > 0),
        updatedAt: Date.now(),
      },
    })),

  setSubtitles: (subtitles) =>
    set((s) => ({
      project: { ...s.project, subtitles, updatedAt: Date.now() },
    })),

  setChapters: (chapters) =>
    set((s) => ({
      project: { ...s.project, chapters, updatedAt: Date.now() },
    })),

  addChapter: (partial) => {
    const chapter: Chapter = {
      id: nanoid(),
      title: "New Chapter",
      startFrame: 0,
      endFrame: 0,
      subtitleIds: [],
      ...partial,
    };
    set((s) => ({
      project: {
        ...s.project,
        chapters: [...(s.project.chapters ?? []), chapter],
        updatedAt: Date.now(),
      },
    }));
    return chapter;
  },

  updateChapter: (id, updates) =>
    set((s) => ({
      project: {
        ...s.project,
        chapters: (s.project.chapters ?? []).map((ch) =>
          ch.id === id ? { ...ch, ...updates } : ch
        ),
        updatedAt: Date.now(),
      },
    })),

  removeChapter: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        chapters: (s.project.chapters ?? []).filter((ch) => ch.id !== id),
        updatedAt: Date.now(),
      },
    })),

  addTrimRegion: (partial) => {
    const region: TrimRegion = {
      id: nanoid(),
      startFrame: 0,
      endFrame: 30,
      ...partial,
    };
    set((s) => ({
      project: {
        ...s.project,
        trimRegions: [...(s.project.trimRegions ?? []), region],
        updatedAt: Date.now(),
      },
    }));
    return region;
  },

  updateTrimRegion: (id, updates) =>
    set((s) => ({
      project: {
        ...s.project,
        trimRegions: (s.project.trimRegions ?? []).map((r) =>
          r.id === id ? { ...r, ...updates } : r
        ),
        updatedAt: Date.now(),
      },
    })),

  removeTrimRegion: (id) =>
    set((s) => ({
      project: {
        ...s.project,
        trimRegions: (s.project.trimRegions ?? []).filter((r) => r.id !== id),
        updatedAt: Date.now(),
      },
    })),

  updateComposition: (updates) =>
    set((s) => ({
      project: {
        ...s.project,
        composition: { ...s.project.composition, ...updates },
        updatedAt: Date.now(),
      },
    })),

  updateExportSettings: (updates) =>
    set((s) => ({
      project: {
        ...s.project,
        exportSettings: { ...s.project.exportSettings, ...updates },
        updatedAt: Date.now(),
      },
    })),

  pushHistory: () =>
    set((s) => {
      const newHistory = s.history.slice(0, s.historyIndex + 1);
      newHistory.push(structuredClone(s.project));
      if (newHistory.length > 50) newHistory.shift();
      return { history: newHistory, historyIndex: newHistory.length - 1 };
    }),

  undo: () =>
    set((s) => {
      if (s.historyIndex < 0) return s;
      const project = s.history[s.historyIndex];
      return { project, historyIndex: s.historyIndex - 1 };
    }),

  redo: () =>
    set((s) => {
      if (s.historyIndex >= s.history.length - 1) return s;
      const project = s.history[s.historyIndex + 1];
      return { project, historyIndex: s.historyIndex + 1 };
    }),
}));
