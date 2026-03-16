"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { ShowcaseVideo } from "@/remotion/ShowcaseVideo";
import { useProjectStore } from "@/lib/store/project-store";
import { useEditorStore } from "@/lib/store/editor-store";
import {
  buildSegments,
  computeTrimmedDuration,
  outputToSourceFrame,
  sourceToOutputFrame,
  snapToKeptFrame,
} from "@/lib/video/trim-mapping";
import type { TrimRegion } from "@/lib/types/project";

const EMPTY_TRIMS: TrimRegion[] = [];

export function VideoPreview() {
  const playerRef = useRef<PlayerRef>(null);
  const { project } = useProjectStore();
  const { isPlaying, currentFrame, setCurrentFrame, setIsPlaying } = useEditorStore();
  const rawDuration = project.video?.durationInFrames;
  const originalDuration = rawDuration && Number.isFinite(rawDuration) && rawDuration > 0 ? Math.round(rawDuration) : 300;

  const trimRegions = project.trimRegions ?? EMPTY_TRIMS;
  const hasTrim = trimRegions.length > 0;

  const segments = useMemo(
    () => (hasTrim ? buildSegments(originalDuration, trimRegions) : null),
    [hasTrim, originalDuration, trimRegions]
  );

  const effectiveDuration = useMemo(
    () => (hasTrim ? computeTrimmedDuration(originalDuration, trimRegions) : originalDuration),
    [hasTrim, originalDuration, trimRegions]
  );

  const handleFrameUpdate = useCallback(
    (e: { detail: { frame: number } }) => {
      const outputFrame = e.detail.frame;
      if (segments) {
        // Convert output frame back to source frame for the store
        setCurrentFrame(outputToSourceFrame(outputFrame, segments));
      } else {
        setCurrentFrame(outputFrame);
      }
    },
    [setCurrentFrame, segments]
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    const onPause = () => setIsPlaying(false);
    const onPlay = () => setIsPlaying(true);
    const onEnded = () => setIsPlaying(false);
    player.addEventListener("frameupdate", handleFrameUpdate as EventListener);
    player.addEventListener("pause", onPause);
    player.addEventListener("play", onPlay);
    player.addEventListener("ended", onEnded);
    return () => {
      player.removeEventListener("frameupdate", handleFrameUpdate as EventListener);
      player.removeEventListener("pause", onPause);
      player.removeEventListener("play", onPlay);
      player.removeEventListener("ended", onEnded);
    };
  }, [handleFrameUpdate, setIsPlaying]);

  // Sync play/pause from store to player
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    if (isPlaying) {
      player.play();
    } else {
      player.pause();
    }
  }, [isPlaying]);

  // Sync seek from store to player (when triggered externally, not by player itself)
  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;

    let targetOutputFrame: number;
    if (segments) {
      // Convert source frame to output frame
      const mapped = sourceToOutputFrame(currentFrame, segments);
      if (mapped !== null) {
        targetOutputFrame = mapped;
      } else {
        // Source frame is inside a trimmed region — snap to nearest kept frame
        const snapped = snapToKeptFrame(currentFrame, segments);
        const snappedOutput = sourceToOutputFrame(snapped, segments);
        targetOutputFrame = snappedOutput ?? 0;
      }
    } else {
      targetOutputFrame = currentFrame;
    }

    const playerFrame = player.getCurrentFrame();
    if (Math.abs(playerFrame - targetOutputFrame) > 1) {
      player.seekTo(targetOutputFrame);
    }
  }, [currentFrame, segments]);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-black">
      <Player
        ref={playerRef}
        component={ShowcaseVideo}
        inputProps={{
          video: project.video,
          composition: project.composition,
          subtitles: project.subtitles,
          ...(hasTrim
            ? {
                trimRegions: project.trimRegions,
                originalDurationInFrames: originalDuration,
              }
            : {}),
        }}
        durationInFrames={effectiveDuration}
        compositionWidth={project.composition.width}
        compositionHeight={project.composition.height}
        fps={project.composition.fps}
        style={{
          width: "100%",
          height: "100%",
        }}
        controls={false}
        autoPlay={false}
        loop
      />
    </div>
  );
}
