export async function generateFrameStrip(
  videoUrl: string,
  totalDuration: number,
  intervalSeconds: number = 2,
  thumbWidth: number = 160,
  thumbHeight: number = 90
): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.crossOrigin = "anonymous";
    video.muted = true;
    video.preload = "auto";

    const canvas = document.createElement("canvas");
    canvas.width = thumbWidth;
    canvas.height = thumbHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      reject(new Error("Cannot get canvas context"));
      return;
    }

    const frames: string[] = [];
    const timestamps: number[] = [];
    for (let t = 0; t < totalDuration; t += intervalSeconds) {
      timestamps.push(t);
    }

    let index = 0;

    const captureNext = () => {
      if (index >= timestamps.length) {
        video.src = "";
        resolve(frames);
        return;
      }

      video.currentTime = timestamps[index];
    };

    video.addEventListener("seeked", () => {
      ctx.drawImage(video, 0, 0, thumbWidth, thumbHeight);
      frames.push(canvas.toDataURL("image/jpeg", 0.5));
      index++;
      captureNext();
    });

    video.addEventListener("error", () => {
      resolve(frames); // return whatever we got
    });

    video.addEventListener("loadeddata", () => {
      captureNext();
    });

    video.src = videoUrl;
  });
}
