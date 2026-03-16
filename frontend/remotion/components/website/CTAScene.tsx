import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";

interface CTASceneProps {
  title: string;
  subtitle?: string;
  websiteUrl?: string;
  brandColors: { primary: string; secondary: string; accent: string };
}

export const CTAScene: React.FC<CTASceneProps> = ({
  title,
  subtitle,
  websiteUrl,
  brandColors,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Title spring scale
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 10, stiffness: 80 },
  });
  const titleScale = interpolate(titleSpring, [0, 1], [0.5, 1]);

  // Subtitle fade (15 frames after title)
  const subtitleSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 15, stiffness: 100 },
  });

  // URL typewriter effect
  const urlText = websiteUrl || "";
  const urlStart = 30;
  const charsToShow = Math.min(
    urlText.length,
    Math.floor(
      interpolate(frame - urlStart, [0, 30], [0, urlText.length], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  const urlOpacity = interpolate(frame, [urlStart, urlStart + 5], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Background gradient pulse
  const pulseOpacity = interpolate(Math.sin(frame * 0.05), [-1, 1], [0.8, 1]);

  const shimmerPosition = interpolate(frame, [0, durationInFrames], [0, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const sparkleBurst = spring({
    frame: Math.max(0, frame - 10),
    fps,
    config: { damping: 14, stiffness: 120, mass: 0.8 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        background: `radial-gradient(ellipse at center, ${brandColors.primary}15, transparent 70%)`,
        opacity: pulseOpacity,
      }}
    >
      {[300, 500, 700].map((size, i) => {
        const localPulse = interpolate(
          Math.sin(frame * (0.03 + i * 0.008) + i * 1.4),
          [-1, 1],
          [0.92, 1.08],
        );

        return (
          <div
            key={`ring-${size}`}
            style={{
              position: "absolute",
              width: size,
              height: size,
              borderRadius: "50%",
              border: `1px solid ${brandColors.primary}`,
              opacity: 0.15,
              transform: `scale(${localPulse.toFixed(3)})`,
            }}
          />
        );
      })}

      {Array.from({ length: 20 }).map((_, i) => {
        const angle = (i / 20) * Math.PI * 2;
        const distance = interpolate(
          sparkleBurst,
          [0, 1],
          [0, 300 + (i % 5) * 45],
        );
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        const sparkleOpacity = interpolate(frame, [10, 18, 45], [0, 0.95, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={`sparkle-${i}`}
            style={{
              position: "absolute",
              width: 10,
              height: 10,
              transform: `translate(${x}px, ${y}px) rotate(45deg)`,
              background: i % 2 === 0 ? "#ffffff" : brandColors.accent,
              opacity: sparkleOpacity,
              boxShadow: `0 0 16px ${i % 2 === 0 ? "rgba(255,255,255,0.8)" : brandColors.accent}`,
            }}
          />
        );
      })}

      {/* Title */}
      <div
        style={{
          fontSize: 64,
          fontWeight: 800,
          color: "transparent",
          fontFamily: "Space Grotesk, system-ui, sans-serif",
          textAlign: "center",
          transform: `scale(${titleScale})`,
          opacity: titleSpring,
          maxWidth: "80%",
          lineHeight: 1.2,
          background: `linear-gradient(90deg, #ffffff 0%, ${brandColors.accent} 50%, #ffffff 100%)`,
          backgroundSize: "200% 100%",
          backgroundPosition: `${shimmerPosition}% 0%`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {title}
      </div>

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            fontSize: 28,
            fontWeight: 400,
            color: "rgba(255,255,255,0.8)",
            fontFamily: "DM Sans, system-ui, sans-serif",
            textAlign: "center",
            marginTop: 24,
            opacity: subtitleSpring,
            transform: `translateY(${interpolate(subtitleSpring, [0, 1], [15, 0])}px)`,
            maxWidth: "60%",
          }}
        >
          {subtitle}
        </div>
      )}

      {/* URL with typewriter */}
      {urlText && (
        <div
          style={{
            position: "absolute",
            bottom: 80,
            fontSize: 20,
            fontWeight: 500,
            color: brandColors.accent || brandColors.primary,
            fontFamily: "JetBrains Mono, monospace",
            opacity: urlOpacity,
            letterSpacing: 1,
          }}
        >
          {urlText.slice(0, charsToShow)}
          <span
            style={{
              opacity: frame % 20 < 10 ? 1 : 0,
              color: brandColors.primary,
              textShadow: `0 0 8px ${brandColors.accent}`,
            }}
          >
            |
          </span>
        </div>
      )}
    </AbsoluteFill>
  );
};
