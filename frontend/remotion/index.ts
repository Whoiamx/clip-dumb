import { registerRoot } from "remotion";
import { Composition } from "remotion";
import React from "react";
import { ShowcaseVideo, type ShowcaseVideoProps } from "./ShowcaseVideo";

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ShowcaseVideo"
        component={ShowcaseVideo}
        durationInFrames={300}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          video: null,
          composition: {
            fps: 30,
            width: 1920,
            height: 1080,
            backgroundType: "gradient" as const,
            backgroundColor: "#000000",
            gradientColors: ["#0f0f23", "#1a1a3e", "#0f0f23"],
            deviceMockup: null,
          },
          subtitles: [],
        } satisfies ShowcaseVideoProps}
      />
    </>
  );
};

registerRoot(RemotionRoot);
