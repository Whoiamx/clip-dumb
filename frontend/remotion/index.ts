import { registerRoot } from "remotion";
import { Composition } from "remotion";
import React from "react";
import { ShowcaseVideo, type ShowcaseVideoProps } from "./ShowcaseVideo";
import { WebsiteShowcase, type WebsiteShowcaseProps } from "./WebsiteShowcase";

const defaultWebsiteShowcaseProps: WebsiteShowcaseProps = {
  script: {
    websiteTitle: "Example Website",
    websiteTagline: "Build something amazing",
    brandColors: { primary: "#FF5E3A", secondary: "#1a1a3e", accent: "#F5C542" },
    scenes: [
      { id: "s1", type: "hero-reveal", title: "Welcome", screenshotIndex: 0, durationFrames: 120, animation: "perspective-3d" },
      { id: "s2", type: "feature-highlight", title: "Features", screenshotIndex: 1, durationFrames: 150, animation: "slide-left", features: ["Fast Performance", "Easy to Use", "Beautiful Design"] },
      { id: "s3", type: "scroll-demo", title: "Full Experience", screenshotIndex: 2, durationFrames: 150, animation: "parallax-scroll" },
      { id: "s4", type: "stats", title: "By the Numbers", screenshotIndex: 1, durationFrames: 120, animation: "fade-scale", stats: [{ label: "Users", value: "10K+" }, { label: "Uptime", value: "99.9%" }, { label: "Reviews", value: "4.9/5" }] },
      { id: "s5", type: "cta", title: "Get Started Today", subtitle: "Join thousands of happy users", screenshotIndex: 0, durationFrames: 90, animation: "zoom-in" },
    ],
    totalDurationFrames: 630,
    musicMood: "corporate",
  },
  screenshotUrls: [],
  fullPageScreenshotUrl: "",
};

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShowcaseVideo"
        component={ShowcaseVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          video: null,
          composition: {
            fps: 30,
            width: 1920,
            height: 1080,
            backgroundType: "gradient" as const,
            backgroundColor: "#000000",
            gradientColors: ["#0f0f23", "#1a1a3e", "#0f0f23"],
            deviceMockup: null,
          },
          subtitles: [],
        } satisfies ShowcaseVideoProps}
      />
      <Composition
        id="WebsiteShowcase"
        component={WebsiteShowcase}
        durationInFrames={630}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={defaultWebsiteShowcaseProps}
      />
    </>
  );
};

registerRoot(RemotionRoot);
