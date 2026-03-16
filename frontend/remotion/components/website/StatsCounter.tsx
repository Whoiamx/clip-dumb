import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { GlowEffect } from "./GlowEffect";

interface Stat {
  label: string;
  value: string;
}

interface StatsCounterProps {
  stats: Stat[];
  title: string;
  screenshotUrl: string;
  brandColors: { primary: string; secondary: string; accent: string };
}

function parseNumericValue(
  value: string,
): { prefix: string; number: number; suffix: string } | null {
  const match = value.match(/^([^\d]*)([\d,.]+)(.*)$/);
  if (!match) return null;
  return {
    prefix: match[1],
    number: parseFloat(match[2].replace(/,/g, "")),
    suffix: match[3],
  };
}

function formatNumber(n: number, original: string): string {
  // Preserve original formatting style
  if (original.includes(",")) {
    return n.toLocaleString("en-US");
  }
  if (n >= 1000 && original.includes("K")) {
    return Math.round(n).toString();
  }
  if (Number.isInteger(n)) return Math.round(n).toString();
  return n.toFixed(1);
}

export const StatsCounter: React.FC<StatsCounterProps> = ({
  stats,
  title,
  screenshotUrl,
  brandColors,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const backgroundOpacity = interpolate(frame, [0, 24], [0, 0.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={screenshotUrl}
        alt=""
        crossOrigin="anonymous"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "blur(20px) brightness(0.3)",
          opacity: backgroundOpacity,
          transform: "scale(1.07)",
        }}
      />

      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(8,10,18,0.25), rgba(8,10,18,0.8))",
        }}
      />

      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          fontSize: 46,
          fontWeight: 700,
          color: "#ffffff",
          fontFamily: "Space Grotesk, system-ui, sans-serif",
          textShadow: "0 6px 24px rgba(0,0,0,0.45)",
        }}
      >
        {title}
      </div>

      <div
        style={{
          display: "flex",
          gap: 60,
          position: "relative",
          zIndex: 2,
        }}
      >
        {stats.slice(0, 4).map((stat, i) => {
          const staggerDelay = i * 10;

          // Scale entrance
          const scaleSpring = spring({
            frame: Math.max(0, frame - staggerDelay),
            fps,
            config: { damping: 12, stiffness: 100 },
          });
          const scale = interpolate(scaleSpring, [0, 1], [0.5, 1]);
          const opacity = scaleSpring;

          // Counter animation
          const parsed = parseNumericValue(stat.value);
          let displayValue = stat.value;

          if (parsed) {
            const countProgress = interpolate(
              frame - staggerDelay,
              [5, 45],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );
            const currentNumber = parsed.number * countProgress;
            displayValue = `${parsed.prefix}${formatNumber(currentNumber, stat.value)}${parsed.suffix}`;
          }

          const ringProgress = interpolate(
            frame - staggerDelay,
            [5, 45],
            [0, 1],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );

          const radius = 50;
          const circumference = 2 * Math.PI * radius;
          const dashOffset = circumference * (1 - ringProgress);

          return (
            <div
              key={i}
              style={{
                textAlign: "center",
                transform: `scale(${scale})`,
                opacity,
                minWidth: 220,
                position: "relative",
              }}
            >
              <GlowEffect
                color={brandColors.primary}
                size={260}
                x={-20}
                y={-70}
                pulseSpeed={0.045 + i * 0.01}
                intensity={0.38}
              />

              <svg
                width={120}
                height={120}
                viewBox="0 0 120 120"
                style={{ margin: "0 auto 14px", display: "block" }}
              >
                <circle
                  cx={60}
                  cy={60}
                  r={radius}
                  fill="none"
                  stroke="rgba(255,255,255,0.16)"
                  strokeWidth={8}
                />
                <circle
                  cx={60}
                  cy={60}
                  r={radius}
                  fill="none"
                  stroke={brandColors.primary}
                  strokeWidth={8}
                  strokeLinecap="round"
                  strokeDasharray={circumference}
                  strokeDashoffset={dashOffset}
                  transform="rotate(-90 60 60)"
                />
              </svg>

              <div
                style={{
                  fontSize: 72,
                  fontWeight: 800,
                  color: brandColors.primary,
                  fontFamily: "Space Grotesk, system-ui, sans-serif",
                  lineHeight: 1,
                  textShadow: `0 0 30px ${brandColors.primary}99`,
                }}
              >
                {displayValue}
              </div>

              <div
                style={{
                  width: 40,
                  height: 3,
                  borderRadius: 999,
                  background: brandColors.accent,
                  margin: "12px auto 0",
                  transform: `scaleX(${scaleSpring.toFixed(3)})`,
                  transformOrigin: "center",
                }}
              />

              <div
                style={{
                  fontSize: 20,
                  fontWeight: 500,
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "DM Sans, system-ui, sans-serif",
                  marginTop: 12,
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
