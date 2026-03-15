export interface RecorderOptions {
  mimeType?: string;
  timeslice?: number;
}

export function createMediaRecorder(
  stream: MediaStream,
  options: RecorderOptions = {}
): {
  recorder: MediaRecorder;
  getBlob: () => Promise<Blob>;
} {
  const mimeType = options.mimeType || "video/webm;codecs=vp9";
  const chunks: Blob[] = [];

  const recorder = new MediaRecorder(stream, { mimeType });

  recorder.ondataavailable = (e) => {
    if (e.data.size > 0) chunks.push(e.data);
  };

  const getBlob = () =>
    new Promise<Blob>((resolve) => {
      if (recorder.state === "inactive") {
        resolve(new Blob(chunks, { type: "video/webm" }));
      } else {
        recorder.onstop = () => {
          resolve(new Blob(chunks, { type: "video/webm" }));
        };
      }
    });

  recorder.start(options.timeslice ?? 100);

  return { recorder, getBlob };
}
