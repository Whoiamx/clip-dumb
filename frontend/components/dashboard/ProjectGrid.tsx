"use client";

import { ProjectCard } from "./ProjectCard";
import type { Project } from "@/lib/types/project";

interface ProjectGridProps {
  projects: Project[];
  onDelete: (id: string) => void;
}

export function ProjectGrid({ projects, onDelete }: ProjectGridProps) {
  const sorted = [...projects].sort((a, b) => b.updatedAt - a.updatedAt);

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {sorted.map((project) => (
        <ProjectCard key={project.id} project={project} onDelete={onDelete} />
      ))}
    </div>
  );
}
