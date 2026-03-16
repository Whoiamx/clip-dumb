import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { GlowEffect } from "./GlowEffect";

interface HeroRevealProps {
  screenshotUrl: string;
  title: string;
  tagline: string;
  brandColors: { primary: string; secondary: string; accent: string };
}

export const HeroReveal: React.FC<HeroRevealProps> = ({
  screenshotUrl,
  title,
  tagline,
  brandColors,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Browser mockup entrance with spring
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 12, stiffness: 100, mass: 1 },
  });

  const mockupY = interpolate(entrySpring, [0, 1], [120, 0]);
  const rotateX = interpolate(entrySpring, [0, 1], [15, 0]);
  const rotateY = interpolate(entrySpring, [0, 1], [-5, 0]);
  const shadowOpacity = interpolate(entrySpring, [0, 1], [0, 0.5]);
  const mockupScale = interpolate(entrySpring, [0, 1], [0.85, 1]);

  const sweepX = interpolate(frame, [20, 50], [-100, 100], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  // Title entrance (staggered)
  const titleSpring = spring({
    frame: Math.max(0, frame - 15),
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const titleOpacity = titleSpring;
  const titleY = interpolate(titleSpring, [0, 1], [30, 0]);

  // Tagline entrance (more staggered)
  const taglineSpring = spring({
    frame: Math.max(0, frame - 30),
    fps,
    config: { damping: 15, stiffness: 100 },
  });
  const taglineOpacity = taglineSpring;
  const taglineY = interpolate(taglineSpring, [0, 1], [20, 0]);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        perspective: 1200,
      }}
    >
      <GlowEffect
        color={brandColors.primary}
        size={1100}
        x={410}
        y={-10}
        intensity={0.52}
      />

      {Array.from({ length: 12 }).map((_, i) => {
        const angle = (i / 12) * Math.PI * 2 + (i % 2 === 0 ? 0.1 : -0.1);
        const burstSpring = spring({
          frame: Math.max(0, frame - 1),
          fps,
          config: { damping: 14, stiffness: 120, mass: 0.7 },
        });
        const targetRadius = 220 + (i % 4) * 55;
        const radius = interpolate(burstSpring, [0, 1], [0, targetRadius]);
        const centerX = 960;
        const centerY = 440;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        const alpha = interpolate(frame, [0, 8, 26, 36], [0, 0.95, 0.9, 0], {
          extrapolateLeft: "clamp",
          extrapolateRight: "clamp",
        });

        return (
          <div
            key={`hero-particle-${i}`}
            style={{
              position: "absolute",
              left: x,
              top: y,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: i % 2 === 0 ? brandColors.accent : "#ffffff",
              opacity: alpha,
              boxShadow: `0 0 16px rgba(255,255,255,${Math.max(0, alpha * 0.9)})`,
            }}
          />
        );
      })}

      {/* Browser mockup with screenshot */}
      <div
        style={{
          position: "relative",
          transform: `translateY(${mockupY}px) scale(${mockupScale}) perspective(1200px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`,
          boxShadow: `0 30px 80px rgba(0,0,0,${shadowOpacity})`,
          borderRadius: 12,
          overflow: "hidden",
          width: 960,
          background: "#2a2a2a",
        }}
      >
        {/* Browser toolbar */}
        <div
          style={{
            height: 44,
            background: "#2a2a2a",
            display: "flex",
            alignItems: "center",
            paddingLeft: 16,
            gap: 8,
          }}
        >
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#ff5f57",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#febc2e",
            }}
          />
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: "#28c840",
            }}
          />
          <div
            style={{
              marginLeft: 16,
              flex: 1,
              maxWidth: 400,
              height: 26,
              borderRadius: 6,
              background: "#1a1a1a",
            }}
          />
        </div>
        {/* Screenshot */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={screenshotUrl}
          alt=""
          crossOrigin="anonymous"
          style={{
            width: 960,
            height: 540,
            objectFit: "cover",
            display: "block",
          }}
        />

        <div
          style={{
            position: "absolute",
            top: 44,
            left: "-100%",
            width: "200%",
            height: 540,
            background: `linear-gradient(105deg, transparent 40%, ${brandColors.accent}55 50%, transparent 60%)`,
            transform: `translateX(${sweepX}%)`,
            mixBlendMode: "overlay",
            pointerEvents: "none",
          }}
        />
      </div>

      {/* Title overlay */}
      <div
        style={{
          position: "absolute",
          bottom: 80,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleOpacity,
          transform: `translateY(${titleY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 56,
            fontWeight: 800,
            color: "#ffffff",
            textShadow: `0 0 40px ${brandColors.primary}cc, 0 0 80px ${brandColors.primary}66, 0 4px 20px rgba(0,0,0,0.6)`,
            fontFamily: "Space Grotesk, system-ui, sans-serif",
          }}
        >
          {title}
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          bottom: 40,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: taglineOpacity,
          transform: `translateY(${taglineY}px)`,
        }}
      >
        <div
          style={{
            fontSize: 24,
            fontWeight: 400,
            color: brandColors.accent || "#f5c542",
            textShadow: "0 2px 10px rgba(0,0,0,0.5)",
            fontFamily: "DM Sans, system-ui, sans-serif",
          }}
        >
          {tagline}
        </div>
      </div>
    </AbsoluteFill>
  );
};
