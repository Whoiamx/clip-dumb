import React from "react";
import { interpolate, useCurrentFrame } from "remotion";

interface GlowEffectProps {
  color: string;
  size: number;
  x: number;
  y: number;
  pulseSpeed?: number;
  intensity?: number;
}

const toRgba = (color: string, alpha: number): string => {
  const safeAlpha = Math.max(0, Math.min(1, alpha));

  if (color.startsWith("#")) {
    let hex = color.slice(1);

    if (hex.length === 3) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    if (hex.length >= 6) {
      const r = parseInt(hex.slice(0, 2), 16);
      const g = parseInt(hex.slice(2, 4), 16);
      const b = parseInt(hex.slice(4, 6), 16);
      return `rgba(${r}, ${g}, ${b}, ${safeAlpha})`;
    }
  }

  return color;
};

export const GlowEffect: React.FC<GlowEffectProps> = ({
  color,
  size,
  x,
  y,
  pulseSpeed = 0.04,
  intensity = 0.55,
}) => {
  const frame = useCurrentFrame();
  const pulse = interpolate(
    Math.sin(frame * pulseSpeed),
    [-1, 1],
    [0.85, 1.15],
  );
  const alpha = Math.max(0.08, Math.min(0.95, intensity * pulse));

  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: y,
        width: size,
        height: size,
        borderRadius: "50%",
        pointerEvents: "none",
        background: `radial-gradient(ellipse at center, ${toRgba(color, alpha)} 0%, ${toRgba(color, alpha * 0.45)} 35%, transparent 70%)`,
        filter: `blur(${Math.round(size * 0.08)}px)`,
        transform: `scale(${pulse.toFixed(3)})`,
        mixBlendMode: "screen",
      }}
    />
  );
};
