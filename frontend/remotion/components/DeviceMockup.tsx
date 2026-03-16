import React from "react";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  OffthreadVideo,
  Img,
} from "remotion";
import type { DeviceMockupConfig } from "@/lib/types/project";

interface DeviceMockupProps {
  config: DeviceMockupConfig;
  videoSrc: string;
  startFrom?: number;
}

const MOCKUP_STYLES: Record<
  DeviceMockupConfig["type"],
  {
    borderRadius: number;
    padding: number[];
    bezelColor: string;
    label: string;
  }
> = {
  "macbook-pro": {
    borderRadius: 12,
    padding: [24, 24, 48, 24],
    bezelColor: "#1a1a1a",
    label: "MacBook Pro",
  },
  "iphone-15": {
    borderRadius: 40,
    padding: [40, 16, 40, 16],
    bezelColor: "#1a1a1a",
    label: "iPhone 15",
  },
  ipad: {
    borderRadius: 24,
    padding: [32, 24, 32, 24],
    bezelColor: "#1a1a1a",
    label: "iPad",
  },
  browser: {
    borderRadius: 12,
    padding: [48, 2, 2, 2],
    bezelColor: "#2a2a2a",
    label: "Browser",
  },
};

export const DeviceMockup: React.FC<DeviceMockupProps> = ({
  config,
  videoSrc,
  startFrom,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();

  const mockupStyle = MOCKUP_STYLES[config.type];

  const entryScale = spring({
    frame,
    fps,
    config: { damping: 25, stiffness: 80, mass: 1.2 },
  });

  const scale = interpolate(entryScale, [0, 1], [0.85, config.scale]);
  const shadowOpacity = interpolate(entryScale, [0, 1], [0, 0.4]);

  const [pt, pr, pb, pl] = mockupStyle.padding;

  return (
    <div
      style={{
        position: "absolute",
        left: `${config.position.x * 100}%`,
        top: `${config.position.y * 100}%`,
        transform: `translate(-50%, -50%) scale(${scale})`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <div
        style={{
          position: "relative",
          background: mockupStyle.bezelColor,
          borderRadius: mockupStyle.borderRadius,
          paddingTop: pt,
          paddingRight: pr,
          paddingBottom: pb,
          paddingLeft: pl,
          boxShadow: `0 25px 80px rgba(0,0,0,${shadowOpacity}), 0 10px 30px rgba(0,0,0,${shadowOpacity * 0.5})`,
        }}
      >
        {/* Browser toolbar */}
        {config.type === "browser" && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              height: 44,
              background: "#2a2a2a",
              borderRadius: `${mockupStyle.borderRadius}px ${mockupStyle.borderRadius}px 0 0`,
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
        )}

        {/* iPhone notch */}
        {config.type === "iphone-15" && (
          <div
            style={{
              position: "absolute",
              top: 12,
              left: "50%",
              transform: "translateX(-50%)",
              width: 120,
              height: 28,
              borderRadius: 14,
              background: "#000",
              zIndex: 2,
            }}
          />
        )}

        {/* Video content */}
        <div
          style={{
            borderRadius: Math.max(0, mockupStyle.borderRadius - 6),
            overflow: "hidden",
            width: config.type === "iphone-15" ? 340 : config.type === "ipad" ? 800 : 960,
            aspectRatio:
              config.type === "iphone-15"
                ? "9/19.5"
                : config.type === "ipad"
                  ? "4/3"
                  : "16/9",
          }}
        >
          <OffthreadVideo
            src={videoSrc}
            startFrom={startFrom}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        </div>
      </div>

      {/* MacBook base */}
      {config.type === "macbook-pro" && (
        <div
          style={{
            width: "110%",
            height: 12,
            background: "linear-gradient(180deg, #333 0%, #1a1a1a 100%)",
            borderRadius: "0 0 8px 8px",
            marginTop: -1,
          }}
        />
      )}
    </div>
  );
};
