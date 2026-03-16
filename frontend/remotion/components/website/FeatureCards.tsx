import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { GlowEffect } from "./GlowEffect";

interface FeatureCardsProps {
  features: string[];
  title: string;
  screenshotUrl: string;
  brandColors: { primary: string; secondary: string; accent: string };
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({
  features,
  title,
  screenshotUrl,
  brandColors,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Title entrance
  const titleSpring = spring({
    frame,
    fps,
    config: { damping: 15, stiffness: 120 },
  });

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
        perspective: 1000,
      }}
    >
      {/* Section title */}
      <div
        style={{
          position: "absolute",
          top: 120,
          left: 0,
          right: 0,
          textAlign: "center",
          opacity: titleSpring,
          transform: `translateY(${interpolate(titleSpring, [0, 1], [20, 0])}px)`,
        }}
      >
        <div
          style={{
            fontSize: 44,
            fontWeight: 700,
            color: "#ffffff",
            fontFamily: "Space Grotesk, system-ui, sans-serif",
          }}
        >
          {title}
        </div>
      </div>

      {/* Feature cards */}
      <div
        style={{
          display: "flex",
          gap: 32,
          marginTop: 40,
        }}
      >
        {features.slice(0, 4).map((feature, i) => {
          const staggerDelay = i * 8;
          const cardSpring = spring({
            frame: Math.max(0, frame - 15 - staggerDelay),
            fps,
            config: { damping: 14, stiffness: 100 },
          });

          const fromLeft = i % 2 === 0;
          const rotateY = interpolate(
            cardSpring,
            [0, 1],
            [fromLeft ? -8 : 8, 0],
          );
          const translateX = interpolate(
            cardSpring,
            [0, 1],
            [fromLeft ? -60 : 60, 0],
          );
          const cardOpacity = cardSpring;
          const blur = interpolate(cardSpring, [0, 1], [6, 0]);
          const borderAngle = interpolate(
            frame,
            [0, durationInFrames],
            [0, 360],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          );

          return (
            <div
              key={i}
              style={{
                width: 350,
                padding: 1,
                borderRadius: 22,
                background: `conic-gradient(from ${borderAngle + i * 42}deg, ${brandColors.primary}, ${brandColors.accent}, ${brandColors.secondary}, ${brandColors.primary})`,
                transform: `perspective(1000px) rotateY(${rotateY}deg) translateX(${translateX}px)`,
                opacity: cardOpacity,
                textAlign: "center",
                filter: `blur(${blur}px)`,
                position: "relative",
              }}
            >
              <GlowEffect
                color={brandColors.primary}
                size={200}
                x={75}
                y={78}
                pulseSpeed={0.055 + i * 0.01}
                intensity={0.42}
              />

              <div
                style={{
                  borderRadius: 21,
                  background:
                    "linear-gradient(145deg, rgba(12,14,24,0.95), rgba(10,12,22,0.86))",
                  border: "1px solid rgba(255,255,255,0.08)",
                  backdropFilter: "blur(10px)",
                  padding: "14px 20px 28px",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={screenshotUrl}
                  alt=""
                  crossOrigin="anonymous"
                  style={{
                    width: "100%",
                    height: 120,
                    objectFit: "cover",
                    objectPosition: `center ${i * 25}%`,
                    borderRadius: 14,
                    filter: "brightness(0.7) saturate(1.2)",
                    marginBottom: 18,
                  }}
                />

                <div
                  style={{
                    fontSize: 44,
                    fontWeight: 800,
                    color: brandColors.primary,
                    fontFamily: "Space Grotesk, system-ui, sans-serif",
                    marginBottom: 10,
                    opacity: 0.35,
                  }}
                >
                  0{i + 1}
                </div>

                <div
                  style={{
                    fontSize: 22,
                    fontWeight: 600,
                    color: "#ffffff",
                    fontFamily: "DM Sans, system-ui, sans-serif",
                    lineHeight: 1.4,
                  }}
                >
                  {feature}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
