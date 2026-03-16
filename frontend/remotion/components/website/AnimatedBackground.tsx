import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface AnimatedBackgroundProps {
  brandColors: { primary: string; secondary: string; accent: string };
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

const seededPercent = (index: number, offset: number): number => {
  const value = Math.sin(index * 12.9898 + offset * 78.233) * 43758.5453;
  return value - Math.floor(value);
};

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
  brandColors,
}) => {
  const frame = useCurrentFrame();

  const orbs = [
    {
      color: brandColors.primary,
      size: 460,
      baseX: 16,
      baseY: 20,
      ampX: 70,
      ampY: 45,
      speedX: 0.012,
      speedY: 0.018,
      phase: 0,
    },
    {
      color: brandColors.secondary,
      size: 380,
      baseX: 62,
      baseY: 58,
      ampX: 90,
      ampY: 60,
      speedX: 0.015,
      speedY: 0.02,
      phase: 1.6,
    },
    {
      color: brandColors.accent,
      size: 320,
      baseX: 78,
      baseY: 18,
      ampX: 55,
      ampY: 65,
      speedX: 0.013,
      speedY: 0.017,
      phase: 3.1,
    },
  ];

  const particleCount = 30;

  return (
    <AbsoluteFill style={{ pointerEvents: "none", overflow: "hidden" }}>
      {orbs.map((orb, index) => {
        const x =
          orb.baseX + Math.sin(frame * orb.speedX + orb.phase) * orb.ampX;
        const y =
          orb.baseY + Math.sin(frame * orb.speedY + orb.phase * 1.3) * orb.ampY;

        return (
          <div
            key={`orb-${index}`}
            style={{
              position: "absolute",
              width: orb.size,
              height: orb.size,
              left: `${x}%`,
              top: `${y}%`,
              transform: "translate(-50%, -50%)",
              borderRadius: "50%",
              background: `radial-gradient(circle at 50% 50%, ${toRgba(orb.color, 0.16)} 0%, ${toRgba(orb.color, 0.1)} 36%, transparent 72%)`,
              filter: "blur(80px)",
              mixBlendMode: "screen",
            }}
          />
        );
      })}

      {Array.from({ length: particleCount }).map((_, i) => {
        const x = 6 + seededPercent(i, 0.11) * 88;
        const y = 8 + seededPercent(i, 0.73) * 84;
        const size = 2 + Math.floor(seededPercent(i, 1.3) * 3);
        const speed = 0.02 + seededPercent(i, 2.1) * 0.04;
        const phase = seededPercent(i, 3.7) * Math.PI * 2;
        const alpha = interpolate(
          Math.sin(frame * speed + phase),
          [-1, 1],
          [0.2, 0.85],
        );

        return (
          <div
            key={`particle-${i}`}
            style={{
              position: "absolute",
              left: `${x}%`,
              top: `${y}%`,
              width: size,
              height: size,
              borderRadius: "50%",
              background: toRgba("#ffffff", alpha),
              boxShadow: `0 0 8px ${toRgba(brandColors.accent, alpha * 0.9)}`,
            }}
          />
        );
      })}

      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: `calc(24% + ${Math.sin(frame * 0.01) * 20}px)`,
          height: 1,
          background: `linear-gradient(90deg, transparent 0%, ${toRgba(brandColors.primary, 0.2)} 30%, ${toRgba(brandColors.accent, 0.2)} 70%, transparent 100%)`,
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: `calc(74% + ${Math.sin(frame * 0.008 + 2) * 24}px)`,
          width: 1,
          background: `linear-gradient(180deg, transparent 0%, ${toRgba(brandColors.secondary, 0.2)} 35%, ${toRgba(brandColors.primary, 0.2)} 75%, transparent 100%)`,
        }}
      />
    </AbsoluteFill>
  );
};
