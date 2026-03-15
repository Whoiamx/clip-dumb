import React from "react";
import { AbsoluteFill, OffthreadVideo, Sequence } from "remotion";
import { BackgroundGradient } from "./components/BackgroundGradient";
import { AnimatedSubtitle } from "./components/AnimatedSubtitle";
import { DeviceMockup } from "./components/DeviceMockup";
import type {
  CompositionSettings,
  SubtitleEntry,
  VideoSource,
} from "@/lib/types/project";

export interface ShowcaseVideoProps {
  video: VideoSource | null;
  composition: CompositionSettings;
  subtitles: SubtitleEntry[];
}

export const ShowcaseVideo: React.FC<ShowcaseVideoProps> = ({
  video,
  composition,
  subtitles,
}) => {
  return (
    <AbsoluteFill>
      {/* Background */}
      <BackgroundGradient
        type={composition.backgroundType}
        color={composition.backgroundColor}
        gradientColors={composition.gradientColors}
      />

      {/* Video layer */}
      {video?.url && (
        <>
          {composition.deviceMockup ? (
            <DeviceMockup
              config={composition.deviceMockup}
              videoSrc={video.url}
            />
          ) : (
            <AbsoluteFill
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <OffthreadVideo
                src={video.url}
                style={{
                  maxWidth: "90%",
                  maxHeight: "85%",
                  borderRadius: 12,
                  boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
                }}
              />
            </AbsoluteFill>
          )}
        </>
      )}

      {/* Subtitles layer */}
      <AbsoluteFill>
        {subtitles.map((subtitle) => (
          <AnimatedSubtitle key={subtitle.id} subtitle={subtitle} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
