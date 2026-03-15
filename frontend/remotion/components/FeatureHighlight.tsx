import React from "react";
import { useCurrentFrame, useVideoConfig, spring, interpolate } from "remotion";

interface FeatureHighlightProps {
  text: string;
  startFrame: number;
  endFrame: number;
  position: { x: number; y: number };
  color?: string;
}

export const FeatureHighlight: React.FC<FeatureHighlightProps> = ({
  text,
  startFrame,
  endFrame,
  position,
  color = "#6d5cff",
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  if (frame < startFrame || frame > endFrame) return null;

  const relativeFrame = frame - startFrame;
  const duration = endFrame - startFrame;

  const enterSpring = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 18, stiffness: 150, mass: 0.6 },
  });

  const exitOpacity = interpolate(
    relativeFrame,
    [duration - 10, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  const lineWidth = interpolate(enterSpring, [0, 1], [0, 40]);

  return (
    <div
      style={{
        position: "absolute",
        left: `${position.x * 100}%`,
        top: `${position.y * 100}%`,
        transform: "translate(-50%, -50%)",
        opacity: enterSpring * exitOpacity,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <div
        style={{
          width: lineWidth,
          height: 3,
          background: color,
          borderRadius: 2,
        }}
      />
      <span
        style={{
          fontSize: 24,
          fontWeight: 600,
          color: "#fff",
          fontFamily: "Inter, system-ui, sans-serif",
          whiteSpace: "nowrap",
          textShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {text}
      </span>
    </div>
  );
};
