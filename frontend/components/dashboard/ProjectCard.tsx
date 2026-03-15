"use client";

import { useRouter } from "next/navigation";
import { Trash2, Clock, MessageSquare } from "lucide-react";
import type { Project } from "@/lib/types/project";

function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/editor/${project.id}`)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/30 text-left transition-all hover:border-primary/30 hover:bg-card/50"
    >
      {/* Thumbnail */}
      <div className="relative aspect-video w-full overflow-hidden bg-muted/20">
        {project.thumbnailDataUrl ? (
          <img
            src={project.thumbnailDataUrl}
            alt={project.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
            <span className="font-display text-3xl font-bold text-primary/30">
              {project.name.charAt(0).toUpperCase()}
            </span>
          </div>
        )}

        {/* Delete button */}
        <div
          role="button"
          tabIndex={0}
          onClick={(e) => {
            e.stopPropagation();
            onDelete(project.id);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.stopPropagation();
              onDelete(project.id);
            }
          }}
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-background/80 text-muted-foreground opacity-0 backdrop-blur-sm transition-all hover:bg-destructive/90 hover:text-white group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </div>
      </div>

      {/* Info */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <h3 className="truncate font-display text-sm font-semibold">
          {project.name}
        </h3>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(project.updatedAt)}
          </span>
          {project.video && (
            <span>{formatDuration(project.video.durationInSeconds)}</span>
          )}
          {project.subtitles.length > 0 && (
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3 w-3" />
              {project.subtitles.length}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}
