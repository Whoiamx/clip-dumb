"use client";

import { useCallback, useEffect, useRef } from "react";
import { Player, type PlayerRef } from "@remotion/player";
import { ShowcaseVideo } from "@/remotion/ShowcaseVideo";
import { useProjectStore } from "@/lib/store/project-store";
import { useEditorStore } from "@/lib/store/editor-store";

export function VideoPreview() {
  const playerRef = useRef<PlayerRef>(null);
  const { project } = useProjectStore();
  const { isPlaying, currentFrame, setCurrentFrame, setIsPlaying } = useEditorStore();
  const rawDuration = project.video?.durationInFrames;
  const durationInFrames = rawDuration && Number.isFinite(rawDuration) && rawDuration > 0 ? Math.round(rawDuration) : 300;

  const handleFrameUpdate = useCallback(
    (e: { detail: { frame: number } }) => {
      setCurrentFrame(e.detail.frame);
    },
    [setCurrentFrame]
  );

  useEffect(() => {
    const player = playerRef.current;
    if (!player) return;
    player.addEventListener("frameupdate", handleFrameUpdate as EventListener);
    player.addEventListener("pause", () => setIsPlaying(false));
    player.addEventListener("play", () => setIsPlaying(true));
    player.addEventListener("ended", () => setIsPlaying(false));
    return () => {
      player.removeEventListener("frameupdate", handleFrameUpdate as EventListener);
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
    const playerFrame = player.getCurrentFrame();
    // Only seek if the store frame differs significantly from the player's current frame
    if (Math.abs(playerFrame - currentFrame) > 1) {
      player.seekTo(currentFrame);
    }
  }, [currentFrame]);

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden rounded-lg bg-black">
      <Player
        ref={playerRef}
        component={ShowcaseVideo}
        inputProps={{
          video: project.video,
          composition: project.composition,
          subtitles: project.subtitles,
        }}
        durationInFrames={durationInFrames}
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
