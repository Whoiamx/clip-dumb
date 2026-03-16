import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
} from "remotion";

interface SceneTransitionProps {
  children: React.ReactNode;
  transitionFrames?: number;
  type?: "fade" | "blur-scale" | "slide-rotate";
}

export const SceneTransition: React.FC<SceneTransitionProps> = ({
  children,
  transitionFrames = 10,
  type = "fade",
}) => {
  const frame = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();

  // Fade in at start
  const fadeIn = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Fade out at end
  const fadeOut = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const entryProgress = interpolate(frame, [0, transitionFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const exitProgress = interpolate(
    frame,
    [durationInFrames - transitionFrames, durationInFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const opacity = fadeIn * fadeOut;

  if (type === "blur-scale") {
    const entryBlur = interpolate(entryProgress, [0, 1], [8, 0]);
    const exitBlur = interpolate(exitProgress, [0, 1], [0, 8]);
    const blur = Math.max(entryBlur, exitBlur);

    const entryScale = interpolate(entryProgress, [0, 1], [1.05, 1]);
    const exitScale = interpolate(exitProgress, [0, 1], [1, 1.05]);
    const scale = exitProgress > 0 ? exitScale : entryScale;

    return (
      <AbsoluteFill
        style={{
          opacity,
          filter: `blur(${blur}px)`,
          transform: `scale(${scale})`,
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  if (type === "slide-rotate") {
    const entryX = interpolate(entryProgress, [0, 1], [-60, 0]);
    const exitX = interpolate(exitProgress, [0, 1], [0, 60]);
    const translateX = exitProgress > 0 ? exitX : entryX;

    const entryRotate = interpolate(entryProgress, [0, 1], [-2, 0]);
    const exitRotate = interpolate(exitProgress, [0, 1], [0, 2]);
    const rotate = exitProgress > 0 ? exitRotate : entryRotate;

    return (
      <AbsoluteFill
        style={{
          opacity,
          transform: `translateX(${translateX}px) rotate(${rotate}deg)`,
          transformOrigin: "50% 50%",
        }}
      >
        {children}
      </AbsoluteFill>
    );
  }

  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};
