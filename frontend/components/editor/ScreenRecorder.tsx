"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { Circle, Square, Pause, Play, ScreenShare } from "lucide-react";

interface ScreenRecorderProps {
  onRecordingComplete: (blob: Blob) => void;
}

export function ScreenRecorder({ onRecordingComplete }: ScreenRecorderProps) {
  const [state, setState] = useState<"idle" | "recording" | "paused">("idle");
  const [elapsed, setElapsed] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (state === "recording" && dotRef.current) {
      gsap.to(dotRef.current, {
        scale: 1.5,
        opacity: 0.4,
        duration: 0.8,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
    } else if (dotRef.current) {
      gsap.killTweensOf(dotRef.current);
      gsap.set(dotRef.current, { scale: 1, opacity: 1 });
    }
  }, [state]);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) clearInterval(timerRef.current);
  };

  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: 30 },
        audio: true,
      });
      streamRef.current = stream;
      chunksRef.current = [];
      setElapsed(0);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "video/webm;codecs=vp9",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "video/webm" });
        onRecordingComplete(blob);
        stream.getTracks().forEach((t) => t.stop());
        stopTimer();
        setState("idle");
      };

      stream.getVideoTracks()[0].onended = () => {
        if (mediaRecorder.state !== "inactive") {
          mediaRecorder.stop();
        }
      };

      mediaRecorder.start(100);
      setState("recording");
      startTimer();
    } catch {
      setState("idle");
    }
  }, [onRecordingComplete]);

  const pauseRecording = () => {
    mediaRecorderRef.current?.pause();
    setState("paused");
    stopTimer();
  };

  const resumeRecording = () => {
    mediaRecorderRef.current?.resume();
    setState("recording");
    startTimer();
  };

  const stopRecording = () => {
    mediaRecorderRef.current?.stop();
    stopTimer();
  };

  const formatElapsed = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-border/40 bg-card/30 p-7 backdrop-blur-sm">
      {state !== "idle" && (
        <div className="flex items-center gap-3">
          <div ref={dotRef} className="h-2.5 w-2.5 rounded-full bg-red-500" />
          <span className="font-mono text-lg font-medium tabular-nums text-foreground">
            {formatElapsed(elapsed)}
          </span>
        </div>
      )}

      <div className="flex gap-2">
        {state === "idle" && (
          <Button onClick={startRecording} variant="outline" className="gap-2 rounded-full px-6">
            <ScreenShare className="h-4 w-4 text-primary" />
            Record Screen
          </Button>
        )}
        {state === "recording" && (
          <>
            <Button variant="outline" size="icon" onClick={pauseRecording} className="rounded-full">
              <Pause className="h-4 w-4" />
            </Button>
            <Button variant="destructive" onClick={stopRecording} className="rounded-full px-5">
              <Square className="h-3.5 w-3.5" />
              Stop
            </Button>
          </>
        )}
        {state === "paused" && (
          <>
            <Button variant="outline" onClick={resumeRecording} className="rounded-full px-5">
              <Play className="h-4 w-4" />
              Resume
            </Button>
            <Button variant="destructive" onClick={stopRecording} className="rounded-full px-5">
              <Square className="h-3.5 w-3.5" />
              Stop
            </Button>
          </>
        )}
      </div>

      {state === "idle" && (
        <p className="text-xs text-muted-foreground/60">
          Click to capture your screen. Audio is included if available.
        </p>
      )}
    </div>
  );
}
