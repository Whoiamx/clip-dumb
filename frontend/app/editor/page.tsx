"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import gsap from "gsap";
import { useProjectStore } from "@/lib/store/project-store";
import { UploadZone } from "@/components/upload/UploadZone";
import { ScreenRecorder } from "@/components/editor/ScreenRecorder";
import { EditorShell } from "@/components/editor/EditorShell";
import { ArrowLeft, Clapperboard } from "lucide-react";
import Link from "next/link";

export default function EditorPage() {
  const { project, setVideo } = useProjectStore();
  const [stage, setStage] = useState<"upload" | "editor">(
    project.video ? "editor" : "upload"
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
      );
    }
  }, [stage]);

  const processVideoFile = useCallback(
    async (file: File | Blob, type: "upload" | "recording") => {
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

          if (Number.isFinite(video.duration) && video.duration > 0) {
            resolve({ duration: video.duration, width: w, height: h });
          } else {
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

      setStage("editor");
    },
    [setVideo]
  );

  if (stage === "editor") {
    return <EditorShell />;
  }

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-screen flex-col items-center justify-center px-6 geo-pattern"
    >
      {/* Back nav */}
      <Link
        href="/dashboard"
        className="absolute left-6 top-6 flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </Link>

      {/* Logo */}
      <div className="absolute right-6 top-6 flex items-center gap-2 text-muted-foreground/50">
        <Clapperboard className="h-3.5 w-3.5" />
        <span className="font-display text-xs font-medium">ClipDub</span>
      </div>

      {/* Header */}
      <div className="mb-10 text-center">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <Clapperboard className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl font-bold tracking-tight">
          Create your showcase
        </h1>
        <p className="mt-2 text-muted-foreground">
          Upload a video or record your screen to get started
        </p>
      </div>

      <div className="flex w-full max-w-2xl flex-col gap-6">
        <UploadZone
          onVideoSelected={(file) => processVideoFile(file, "upload")}
          className="min-h-[240px]"
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
    </div>
  );
}
