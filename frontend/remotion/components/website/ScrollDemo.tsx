import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
} from "remotion";
import { GlowEffect } from "./GlowEffect";

interface ScrollDemoProps {
  fullPageScreenshotUrl: string;
  brandColors: { primary: string; secondary: string; accent: string };
}

export const ScrollDemo: React.FC<ScrollDemoProps> = ({
  fullPageScreenshotUrl,
  brandColors,
}) => {
  const frame = useCurrentFrame();
  const { fps, durationInFrames } = useVideoConfig();

  // Browser mockup entrance
  const entrySpring = spring({
    frame,
    fps,
    config: { damping: 20, stiffness: 100 },
  });
  const mockupScale = interpolate(entrySpring, [0, 1], [0.9, 1]);

  // Scroll animation — smooth with easing pauses
  // Use full duration minus entry animation time
  const scrollStart = 20;
  const scrollEnd = durationInFrames - 10;
  const getScrollPosition = (value: number): number => {
    return interpolate(
      value,
      [
        scrollStart,
        scrollStart + (scrollEnd - scrollStart) * 0.3,
        scrollStart + (scrollEnd - scrollStart) * 0.5,
        scrollEnd,
      ],
      [0, -800, -1200, -2400],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
    );
  };

  const scrollProgress = getScrollPosition(frame);
  const previousScroll = getScrollPosition(Math.max(0, frame - 1));
  const scrollVelocity = Math.abs(scrollProgress - previousScroll);
  const motionBlur = interpolate(scrollVelocity, [0, 45], [0, 1.5], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  const driftY = interpolate(Math.sin(frame * 0.04), [-1, 1], [10, -10]);
  const progress = interpolate(frame, [scrollStart, scrollEnd], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const ringRadius = 34;
  const ringCircumference = 2 * Math.PI * ringRadius;
  const ringDashOffset = ringCircumference * (1 - progress);

  return (
    <AbsoluteFill
      style={{
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <GlowEffect
        color={brandColors.primary}
        size={980}
        x={470}
        y={90}
        intensity={0.45}
      />

      {/* Browser mockup */}
      <div
        style={{
          width: 1000,
          height: 600,
          borderRadius: 12,
          overflow: "hidden",
          background: "#2a2a2a",
          transform: `translateY(${driftY}px) scale(${mockupScale})`,
          boxShadow: "0 30px 80px rgba(0,0,0,0.5)",
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
            flexShrink: 0,
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
        {/* Scrolling content area */}
        <div
          style={{
            height: 556,
            overflow: "hidden",
            position: "relative",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullPageScreenshotUrl}
            alt=""
            crossOrigin="anonymous"
            style={{
              width: 1000,
              position: "absolute",
              top: 0,
              left: 0,
              transform: `translateY(${scrollProgress}px)`,
              filter: `blur(${motionBlur}px)`,
            }}
          />
        </div>
      </div>

      {[
        { text: "Hero lockup", start: 26, end: 68, x: 190, y: 210 },
        { text: "Feature copy", start: 72, end: 118, x: 1460, y: 310 },
        { text: "Pricing block", start: 122, end: 164, x: 240, y: 680 },
      ].map((callout, i) => {
        const calloutOpacity = interpolate(
          frame,
          [callout.start, callout.start + 8, callout.end - 8, callout.end],
          [0, 1, 1, 0],
          {
            extrapolateLeft: "clamp",
            extrapolateRight: "clamp",
          },
        );

        return (
          <div
            key={`callout-${i}`}
            style={{
              position: "absolute",
              left: callout.x,
              top: callout.y,
              background: brandColors.primary,
              color: "#ffffff",
              padding: "10px 16px",
              borderRadius: 999,
              fontSize: 18,
              fontWeight: 600,
              fontFamily: "DM Sans, system-ui, sans-serif",
              opacity: calloutOpacity,
              boxShadow: "0 10px 28px rgba(0,0,0,0.3)",
            }}
          >
            {callout.text}
          </div>
        );
      })}

      {/* Scroll indicator */}
      <div
        style={{
          position: "absolute",
          right: 100,
          top: "50%",
          transform: "translateY(-50%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 8,
          opacity: interpolate(
            frame,
            [0, 30, durationInFrames - 20, durationInFrames],
            [0, 0.6, 0.6, 0],
            {
              extrapolateLeft: "clamp",
              extrapolateRight: "clamp",
            },
          ),
        }}
      >
        <svg width={96} height={96} viewBox="0 0 96 96">
          <circle
            cx={48}
            cy={48}
            r={ringRadius}
            fill="none"
            stroke="rgba(255,255,255,0.2)"
            strokeWidth={6}
          />
          <circle
            cx={48}
            cy={48}
            r={ringRadius}
            fill="none"
            stroke={brandColors.primary}
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={ringCircumference}
            strokeDashoffset={ringDashOffset}
            transform="rotate(-90 48 48)"
          />
        </svg>
      </div>
    </AbsoluteFill>
  );
};
