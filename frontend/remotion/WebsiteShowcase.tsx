import React from "react";
import { AbsoluteFill, Sequence, interpolate, useCurrentFrame } from "remotion";
import { HeroReveal } from "./components/website/HeroReveal";
import { FeatureCards } from "./components/website/FeatureCards";
import { ScrollDemo } from "./components/website/ScrollDemo";
import { StatsCounter } from "./components/website/StatsCounter";
import { CTAScene } from "./components/website/CTAScene";
import { SceneTransition } from "./components/website/SceneTransition";
import { AnimatedBackground } from "./components/website/AnimatedBackground";
import type { WebsiteShowcaseScript } from "@/lib/types/website-showcase";

export interface WebsiteShowcaseProps {
  script: WebsiteShowcaseScript;
  screenshotUrls: string[];
  fullPageScreenshotUrl: string;
}

const mapAnimationToTransition = (
  animation: WebsiteShowcaseScript["scenes"][number]["animation"],
): "fade" | "blur-scale" | "slide-rotate" => {
  if (animation === "slide-left" || animation === "slide-right") {
    return "slide-rotate";
  }

  if (
    animation === "zoom-in" ||
    animation === "perspective-3d" ||
    animation === "fade-scale"
  ) {
    return "blur-scale";
  }

  return "fade";
};

export const WebsiteShowcase: React.FC<WebsiteShowcaseProps> = ({
  script,
  screenshotUrls,
  fullPageScreenshotUrl,
}) => {
  const frame = useCurrentFrame();
  const { brandColors, scenes } = script;

  // Animated background gradient using brand colors
  const angle = interpolate(
    frame,
    [0, script.totalDurationFrames],
    [135, 155],
    {
      extrapolateRight: "clamp",
    },
  );

  // Compute scene start frames
  let currentFrame = 0;
  const sceneStarts: number[] = [];
  for (const scene of scenes) {
    sceneStarts.push(currentFrame);
    currentFrame += scene.durationFrames;
  }

  return (
    <AbsoluteFill>
      <AnimatedBackground brandColors={brandColors} />

      {/* Background */}
      <AbsoluteFill
        style={{
          background: `linear-gradient(${angle}deg, ${brandColors.primary}08, #0a0a1a 30%, #0f0f23 50%, ${brandColors.secondary}08 100%)`,
        }}
      />

      {/* Scenes */}
      {scenes.map((scene, i) => {
        const from = sceneStarts[i];
        const duration = scene.durationFrames;
        const screenshotUrl =
          screenshotUrls[
            Math.min(scene.screenshotIndex, screenshotUrls.length - 1)
          ] || "";

        return (
          <Sequence key={scene.id} from={from} durationInFrames={duration}>
            <SceneTransition type={mapAnimationToTransition(scene.animation)}>
              {scene.type === "hero-reveal" && (
                <HeroReveal
                  screenshotUrl={screenshotUrl}
                  title={script.websiteTitle}
                  tagline={script.websiteTagline}
                  brandColors={brandColors}
                />
              )}
              {scene.type === "feature-highlight" && (
                <FeatureCards
                  features={scene.features || []}
                  title={scene.title}
                  screenshotUrl={screenshotUrl}
                  brandColors={brandColors}
                />
              )}
              {scene.type === "scroll-demo" && (
                <ScrollDemo
                  fullPageScreenshotUrl={fullPageScreenshotUrl}
                  brandColors={brandColors}
                />
              )}
              {scene.type === "stats" && (
                <StatsCounter
                  stats={scene.stats || []}
                  title={scene.title}
                  screenshotUrl={screenshotUrl}
                  brandColors={brandColors}
                />
              )}
              {scene.type === "cta" && (
                <CTAScene
                  title={scene.title}
                  subtitle={scene.subtitle}
                  brandColors={brandColors}
                />
              )}
            </SceneTransition>
          </Sequence>
        );
      })}

      <AbsoluteFill
        style={{
          pointerEvents: "none",
          background:
            "radial-gradient(ellipse at center, rgba(0,0,0,0) 50%, rgba(0,0,0,0.4) 100%)",
        }}
      />
    </AbsoluteFill>
  );
};
