"use client";

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { UploadZone } from "@/components/upload/UploadZone";
import { ScreenRecorder } from "@/components/editor/ScreenRecorder";
import { useWizardStore } from "@/lib/store/wizard-store";
import { useProjectStore } from "@/lib/store/project-store";
import { generateThumbnail } from "@/lib/video/thumbnail";
import {
  CheckCircle,
  FileVideo,
  Trash2,
  Upload,
  Video,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function StepSource() {
  const { videoFile, videoSourceType, setVideoFile } = useWizardStore();
  const { setVideo, project } = useProjectStore();
  const [showConfirm, setShowConfirm] = useState(false);
  const videoPreviewRef = useRef<HTMLVideoElement>(null);

  const processVideoFile = async (
    file: File | Blob,
    type: "upload" | "recording"
  ) => {
    const url = URL.createObjectURL(file);

    const video = document.createElement("video");
    video.preload = "auto";

    const metadata = await new Promise<{
      duration: number;
      width: number;
      height: number;
    }>((resolve, reject) => {
      video.onloadedmetadata = () => {
        const w = video.videoWidth;
        const h = video.videoHeight;

        // WebM from MediaRecorder often reports Infinity until seeked
        if (Number.isFinite(video.duration) && video.duration > 0) {
          resolve({ duration: video.duration, width: w, height: h });
        } else {
          // Force browser to compute real duration by seeking to end
          video.currentTime = 1e10;
          video.onseeked = () => {
            const dur = Number.isFinite(video.duration) && video.duration > 0
              ? video.duration
              : video.currentTime > 0
                ? video.currentTime
                : 10;
            video.currentTime = 0;
            resolve({ duration: dur, width: w, height: h });
          };
        }
      };
      video.onerror = reject;
      video.src = url;
    });

    const fps = 30;
    const safeDuration = Number.isFinite(metadata.duration) && metadata.duration > 0 ? metadata.duration : 10;
    setVideo({
      type,
      url,
      fileName: file instanceof File ? file.name : "recording.webm",
      durationInFrames: Math.ceil(safeDuration * fps),
      durationInSeconds: safeDuration,
      width: metadata.width,
      height: metadata.height,
    });

    setVideoFile(file, type);

    // Generate thumbnail
    try {
      const thumb = await generateThumbnail(url);
      const { project: currentProject } = useProjectStore.getState();
      useProjectStore.setState({
        project: { ...currentProject, thumbnailDataUrl: thumb },
      });
    } catch {
      // thumbnail is optional
    }
  };

  const handleRemoveVideo = () => {
    setShowConfirm(false);
    // Revoke the object URL to free memory
    if (project.video?.url) {
      URL.revokeObjectURL(project.video.url);
    }
    // Clear wizard store
    useWizardStore.setState({ videoFile: null, videoSourceType: null });
    // Clear project store video
    useProjectStore.setState((s) => ({
      project: {
        ...s.project,
        video: null,
        subtitles: [],
        chapters: [],
        thumbnailDataUrl: undefined,
        updatedAt: Date.now(),
      },
    }));
  };

  if (videoFile && project.video) {
    const isRecording = videoSourceType === "recording";

    return (
      <div className="flex flex-col items-center gap-6 py-4">
        {/* Video preview */}
        <div className="relative w-full max-w-lg overflow-hidden rounded-xl border border-border/40 bg-black">
          <video
            ref={videoPreviewRef}
            src={project.video.url}
            className="w-full"
            controls
            muted
            playsInline
            style={{ maxHeight: 280 }}
          />
          {/* Source badge */}
          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1 text-[11px] font-medium text-white/80 backdrop-blur-sm">
            {isRecording ? (
              <Video className="h-3 w-3 text-red-400" />
            ) : (
              <Upload className="h-3 w-3 text-primary" />
            )}
            {isRecording ? "Screen Recording" : "Uploaded"}
          </div>
        </div>

        {/* File info */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileVideo className="h-4 w-4" />
          <span className="max-w-[200px] truncate font-medium text-foreground/80">
            {project.video.fileName}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>
            {Math.floor(project.video.durationInSeconds / 60)}:
            {Math.floor(project.video.durationInSeconds % 60)
              .toString()
              .padStart(2, "0")}
          </span>
          <span className="text-muted-foreground/40">·</span>
          <span>{formatFileSize(videoFile.size)}</span>
          <span className="text-muted-foreground/40">·</span>
          <span>
            {project.video.width}×{project.video.height}
          </span>
        </div>

        {/* Status + actions */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-500">
            <CheckCircle className="h-3.5 w-3.5" />
            Ready to continue
          </div>
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 rounded-full text-destructive hover:bg-destructive/10 hover:text-destructive"
            onClick={() => setShowConfirm(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove
          </Button>
        </div>

        {/* Confirmation dialog — portal to body so overlay covers everything */}
        {showConfirm && createPortal(
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md"
            onClick={() => setShowConfirm(false)}
          >
            <div
              className="mx-4 w-full max-w-sm animate-in fade-in zoom-in-95 rounded-2xl border border-border bg-background p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-destructive/10 ring-1 ring-destructive/20">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold">
                    Remove this video?
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {project.subtitles.length > 0
                      ? `This will also remove ${project.subtitles.length} generated subtitle${project.subtitles.length === 1 ? "" : "s"} and any chapters.`
                      : "You'll need to upload or record a new video to continue."}
                  </p>
                </div>
                <div className="flex w-full gap-2 pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 rounded-lg"
                    onClick={() => setShowConfirm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1 gap-1.5 rounded-lg"
                    onClick={handleRemoveVideo}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Remove
                  </Button>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="text-center">
        <h2 className="font-display text-xl font-semibold">
          Upload your screen recording
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Upload an existing video or record your screen directly
        </p>
      </div>

      <UploadZone
        onVideoSelected={(file) => processVideoFile(file, "upload")}
        className="min-h-[200px]"
      />

      <div className="flex items-center gap-4">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/50">
          or
        </span>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <ScreenRecorder
        onRecordingComplete={(blob) => processVideoFile(blob, "recording")}
      />
    </div>
  );
}
