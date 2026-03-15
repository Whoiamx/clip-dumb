/**
 * Extracts frames from a video at regular intervals as base64 JPEG strings.
 * Runs entirely client-side using <canvas>.
 */
export async function extractFrames(
  videoUrl: string,
  intervalSeconds: number = 2,
  maxFrames: number = 20
): Promise<string[]> {
  const video = document.createElement("video");
  video.crossOrigin = "anonymous";
  video.preload = "auto";
  video.muted = true;
  video.src = videoUrl;

  await new Promise<void>((resolve, reject) => {
    video.onloadeddata = () => resolve();
    video.onerror = reject;
  });

  const canvas = document.createElement("canvas");
  canvas.width = 1280;
  canvas.height = Math.round((1280 / video.videoWidth) * video.videoHeight);
  const ctx = canvas.getContext("2d")!;

  const duration = video.duration;
  const frames: string[] = [];
  let time = 0;

  while (time < duration && frames.length < maxFrames) {
    video.currentTime = time;
    await new Promise<void>((resolve) => {
      video.onseeked = () => resolve();
    });

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.7);
    // Strip data:image/jpeg;base64, prefix
    frames.push(dataUrl.split(",")[1]);

    time += intervalSeconds;
  }

  return frames;
}
