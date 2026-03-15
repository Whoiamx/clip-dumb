export async function generateThumbnail(videoUrl: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";
    video.muted = true;
    video.crossOrigin = "anonymous";

    video.onloadeddata = () => {
      video.currentTime = Math.min(1, video.duration * 0.1);
    };

    video.onseeked = () => {
      const canvas = document.createElement("canvas");
      canvas.width = 320;
      canvas.height = 180;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Cannot get canvas context"));
        return;
      }
      ctx.drawImage(video, 0, 0, 320, 180);
      resolve(canvas.toDataURL("image/jpeg", 0.7));
    };

    video.onerror = () => reject(new Error("Failed to load video for thumbnail"));
    video.src = videoUrl;
  });
}
