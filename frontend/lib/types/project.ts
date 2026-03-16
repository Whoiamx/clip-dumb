export interface Project {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  type?: "tutorial" | "website-showcase";
  video: VideoSource | null;
  composition: CompositionSettings;
  subtitles: SubtitleEntry[];
  chapters: Chapter[];
  exportSettings: ExportSettings;
  language?: string;
  voiceId?: string;
  thumbnailDataUrl?: string;
  trimRegions?: TrimRegion[];
  websiteShowcase?: import("./website-showcase").WebsiteShowcaseScript;
}

export interface TrimRegion {
  id: string;
  startFrame: number;
  endFrame: number;
}

export interface Chapter {
  id: string;
  title: string;
  startFrame: number;
  endFrame: number;
  subtitleIds: string[];
}

export interface VideoSource {
  type: "upload" | "recording";
  url: string;
  fileName: string;
  durationInFrames: number;
  durationInSeconds: number;
  width: number;
  height: number;
}

export interface SubtitleEntry {
  id: string;
  text: string;
  startFrame: number;
  endFrame: number;
  position: { x: number; y: number };
  style: SubtitleStyle;
  animation: "fade" | "slide-up" | "typewriter" | "scale";
  source: "ai" | "manual";
}

export interface SubtitleStyle {
  fontSize: number;
  fontWeight: "normal" | "bold";
  color: string;
  backgroundColor?: string;
  fontFamily: string;
  textAlign: "left" | "center" | "right";
  outlineColor?: string;
  outlineWidth?: number;
}

export interface CompositionSettings {
  fps: 30 | 60;
  width: number;
  height: number;
  backgroundType: "solid" | "gradient";
  backgroundColor: string;
  gradientColors?: string[];
  deviceMockup: DeviceMockupConfig | null;
}

export interface DeviceMockupConfig {
  type: "macbook-pro" | "iphone-15" | "ipad" | "browser";
  scale: number;
  position: { x: number; y: number };
}

export interface ExportSettings {
  quality: "720p" | "1080p" | "4k";
  format: "mp4";
  codec: "h264";
}

export const DEFAULT_COMPOSITION: CompositionSettings = {
  fps: 30,
  width: 1920,
  height: 1080,
  backgroundType: "gradient",
  backgroundColor: "#000000",
  gradientColors: ["#0f0f23", "#1a1a3e", "#0f0f23"],
  deviceMockup: null,
};

export const DEFAULT_SUBTITLE_STYLE: SubtitleStyle = {
  fontSize: 48,
  fontWeight: "bold",
  color: "#ffffff",
  fontFamily: "Inter, system-ui, sans-serif",
  textAlign: "center",
  outlineColor: "#000000",
  outlineWidth: 0,
};

export const DEFAULT_EXPORT: ExportSettings = {
  quality: "1080p",
  format: "mp4",
  codec: "h264",
};
