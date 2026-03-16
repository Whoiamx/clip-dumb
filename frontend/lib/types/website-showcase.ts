export interface WebsiteScene {
  id: string;
  type: "hero-reveal" | "feature-highlight" | "scroll-demo" | "stats" | "cta";
  title: string;
  subtitle?: string;
  screenshotIndex: number;
  durationFrames: number;
  animation:
    | "zoom-in"
    | "parallax-scroll"
    | "slide-left"
    | "slide-right"
    | "perspective-3d"
    | "fade-scale";
  highlights?: { text: string; position: { x: number; y: number } }[];
  stats?: { label: string; value: string }[];
  features?: string[];
}

export interface WebsiteShowcaseScript {
  websiteTitle: string;
  websiteTagline: string;
  brandColors: { primary: string; secondary: string; accent: string };
  scenes: WebsiteScene[];
  totalDurationFrames: number;
  musicMood: "upbeat" | "corporate" | "minimal" | "energetic";
}

export interface CaptureResult {
  captureId: string;
  title: string;
  description: string;
  ogImage?: string;
  faviconUrl?: string;
  brandColors: string[];
  screenshots: string[];
  fullPageScreenshot: string;
}
