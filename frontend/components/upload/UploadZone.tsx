"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import gsap from "gsap";
import { Upload, Film, X, FileVideo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UploadZoneProps {
  onVideoSelected: (file: File) => void;
  className?: string;
}

export function UploadZone({ onVideoSelected, className }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const zoneRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!iconRef.current) return;
    gsap.fromTo(
      iconRef.current,
      { y: 0 },
      { y: -10, duration: 2, repeat: -1, yoyo: true, ease: "sine.inOut" }
    );
  }, []);

  useEffect(() => {
    if (!zoneRef.current) return;
    if (isDragging) {
      gsap.to(zoneRef.current, {
        scale: 1.01,
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(zoneRef.current, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isDragging]);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const processFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("video/")) return;
      setSelectedFile(file);
      onVideoSelected(file);

      if (zoneRef.current) {
        gsap.fromTo(
          zoneRef.current,
          { scale: 0.98, opacity: 0.8 },
          { scale: 1, opacity: 1, duration: 0.3, ease: "back.out(1.7)" }
        );
      }
    },
    [onVideoSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const file = e.dataTransfer.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  return (
    <div
      ref={zoneRef}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/50 bg-card/30 p-12 backdrop-blur-sm transition-all duration-300",
        isDragging && "border-primary/60 bg-primary/[0.03]",
        selectedFile && "border-primary/30 bg-card/50",
        !selectedFile && "cursor-pointer hover:border-border hover:bg-card/40",
        className
      )}
      onDragEnter={handleDragIn}
      onDragLeave={handleDragOut}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => {
        if (!selectedFile) inputRef.current?.click();
      }}
    >
      {/* Subtle corner accents when dragging */}
      {isDragging && (
        <>
          <div className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-primary/50 rounded-tl" />
          <div className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-primary/50 rounded-tr" />
          <div className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-primary/50 rounded-bl" />
          <div className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-primary/50 rounded-br" />
        </>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={handleFileInput}
      />

      {selectedFile ? (
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
            <Film className="h-7 w-7 text-primary" />
          </div>
          <div className="text-center">
            <p className="font-display font-semibold">{selectedFile.name}</p>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedFile(null);
              if (inputRef.current) inputRef.current.value = "";
            }}
          >
            <X className="h-4 w-4" />
            Choose another
          </Button>
        </div>
      ) : (
        <>
          <div ref={iconRef}>
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted/50 text-muted-foreground/40">
              <Upload className="h-7 w-7" />
            </div>
          </div>
          <p className="mt-5 font-display text-lg font-semibold">
            Drop your video here
          </p>
          <p className="mt-1.5 flex items-center gap-2 text-sm text-muted-foreground">
            <FileVideo className="h-3.5 w-3.5" />
            MP4, WebM, MOV up to 500MB
          </p>
          <Button
            className="mt-7 rounded-full px-6"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              inputRef.current?.click();
            }}
          >
            Browse files
          </Button>
        </>
      )}
    </div>
  );
}
