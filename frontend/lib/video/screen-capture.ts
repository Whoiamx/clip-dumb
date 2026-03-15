export interface CaptureOptions {
  video?: MediaTrackConstraints & { frameRate?: number };
  audio?: boolean;
}

export async function startScreenCapture(
  options: CaptureOptions = {}
): Promise<MediaStream> {
  return navigator.mediaDevices.getDisplayMedia({
    video: { frameRate: options.video?.frameRate ?? 30, ...options.video },
    audio: options.audio ?? true,
  });
}

export function stopScreenCapture(stream: MediaStream): void {
  stream.getTracks().forEach((track) => track.stop());
}
