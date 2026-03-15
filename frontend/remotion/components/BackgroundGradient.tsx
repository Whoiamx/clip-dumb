import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";

interface BackgroundGradientProps {
  type: "solid" | "gradient";
  color: string;
  gradientColors?: string[];
}

export const BackgroundGradient: React.FC<BackgroundGradientProps> = ({
  type,
  color,
  gradientColors,
}) => {
  const frame = useCurrentFrame();

  // Subtle animated gradient shift
  const angle = interpolate(frame, [0, 300], [135, 145], {
    extrapolateRight: "clamp",
  });

  if (type === "solid") {
    return <AbsoluteFill style={{ backgroundColor: color }} />;
  }

  const colors = gradientColors || ["#0f0f23", "#1a1a3e", "#0f0f23"];
  const gradient = `linear-gradient(${angle}deg, ${colors.join(", ")})`;

  return <AbsoluteFill style={{ background: gradient }} />;
};
