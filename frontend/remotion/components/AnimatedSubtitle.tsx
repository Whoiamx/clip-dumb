import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { SubtitleEntry } from "@/lib/types/project";

interface AnimatedSubtitleProps {
  subtitle: SubtitleEntry;
}

export const AnimatedSubtitle: React.FC<AnimatedSubtitleProps> = ({
  subtitle,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const relativeFrame = frame - subtitle.startFrame;
  const duration = subtitle.endFrame - subtitle.startFrame;
  const exitStart = duration - 15;

  if (frame < subtitle.startFrame || frame > subtitle.endFrame) return null;

  // Enter animation
  let opacity = 1;
  let translateY = 0;
  let scale = 1;
  let clipPath = "inset(0 0% 0 0)";

  const enterSpring = spring({
    frame: relativeFrame,
    fps,
    config: { damping: 20, stiffness: 120, mass: 0.8 },
  });

  const exitOpacity = interpolate(
    relativeFrame,
    [exitStart, duration],
    [1, 0],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
  );

  switch (subtitle.animation) {
    case "fade":
      opacity = enterSpring * exitOpacity;
      break;

    case "slide-up":
      opacity = enterSpring * exitOpacity;
      translateY = interpolate(enterSpring, [0, 1], [40, 0]);
      break;

    case "scale":
      opacity = exitOpacity;
      scale = interpolate(enterSpring, [0, 1], [0.5, 1]);
      break;

    case "typewriter": {
      opacity = exitOpacity;
      const progress = interpolate(
        relativeFrame,
        [0, Math.min(30, duration / 2)],
        [0, 100],
        { extrapolateRight: "clamp" }
      );
      clipPath = `inset(0 ${100 - progress}% 0 0)`;
      break;
    }
  }

  return (
    <div
      style={{
        position: "absolute",
        left: `${subtitle.position.x * 100}%`,
        top: `${subtitle.position.y * 100}%`,
        transform: `translate(-50%, -50%) translateY(${translateY}px) scale(${scale})`,
        opacity,
        clipPath,
        fontSize: subtitle.style.fontSize,
        fontWeight: subtitle.style.fontWeight,
        color: subtitle.style.color,
        fontFamily: subtitle.style.fontFamily,
        backgroundColor: subtitle.style.backgroundColor || "transparent",
        padding: subtitle.style.backgroundColor ? "8px 16px" : 0,
        borderRadius: subtitle.style.backgroundColor ? 8 : 0,
        textAlign: subtitle.style.textAlign ?? "center",
        maxWidth: "80%",
        lineHeight: 1.3,
        WebkitTextStroke:
          (subtitle.style.outlineWidth ?? 0) > 0
            ? `${subtitle.style.outlineWidth}px ${subtitle.style.outlineColor ?? "#000000"}`
            : undefined,
        paintOrder: (subtitle.style.outlineWidth ?? 0) > 0 ? "stroke fill" : undefined,
        textShadow: !subtitle.style.backgroundColor && !(subtitle.style.outlineWidth ?? 0)
          ? "0 2px 10px rgba(0,0,0,0.5)"
          : "none",
      }}
    >
      {subtitle.text}
    </div>
  );
};
