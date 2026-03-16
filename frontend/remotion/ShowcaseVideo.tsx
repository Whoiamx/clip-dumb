import React, { useMemo } from "react";
import { AbsoluteFill, OffthreadVideo, Sequence } from "remotion";
import { BackgroundGradient } from "./components/BackgroundGradient";
import { AnimatedSubtitle } from "./components/AnimatedSubtitle";
import { DeviceMockup } from "./components/DeviceMockup";
import type {
  CompositionSettings,
  SubtitleEntry,
  VideoSource,
  TrimRegion,
} from "@/lib/types/project";
import { buildSegments, remapSubtitles } from "@/lib/video/trim-mapping";

export interface ShowcaseVideoProps {
  video: VideoSource | null;
  composition: CompositionSettings;
  subtitles: SubtitleEntry[];
  trimRegions?: TrimRegion[];
  originalDurationInFrames?: number;
}

export const ShowcaseVideo: React.FC<ShowcaseVideoProps> = ({
  video,
  composition,
  subtitles,
  trimRegions,
  originalDurationInFrames,
}) => {
  const hasTrim = trimRegions && trimRegions.length > 0 && originalDurationInFrames;

  const segments = useMemo(() => {
    if (!hasTrim) return null;
    return buildSegments(originalDurationInFrames, trimRegions);
  }, [hasTrim, originalDurationInFrames, trimRegions]);

  const mappedSubtitles = useMemo(() => {
    if (!segments) return subtitles;
    return remapSubtitles(subtitles, segments);
  }, [subtitles, segments]);

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
          {segments ? (
            // Trimmed: render each kept segment as a Sequence
            segments.map((seg, i) => {
              const segDuration = seg.outputEnd - seg.outputStart + 1;
              return (
                <Sequence key={i} from={seg.outputStart} durationInFrames={segDuration}>
                  {composition.deviceMockup ? (
                    <DeviceMockup
                      config={composition.deviceMockup}
                      videoSrc={video.url}
                      startFrom={seg.sourceStart}
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
                        startFrom={seg.sourceStart}
                        style={{
                          maxWidth: "90%",
                          maxHeight: "85%",
                          borderRadius: 12,
                          boxShadow: "0 25px 80px rgba(0,0,0,0.4)",
                        }}
                      />
                    </AbsoluteFill>
                  )}
                </Sequence>
              );
            })
          ) : (
            // No trim: render full video as before
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
        </>
      )}

      {/* Subtitles layer */}
      <AbsoluteFill>
        {mappedSubtitles.map((subtitle) => (
          <AnimatedSubtitle key={subtitle.id} subtitle={subtitle} />
        ))}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
