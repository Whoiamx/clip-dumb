"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ProjectGrid } from "@/components/dashboard/ProjectGrid";
import { EmptyState } from "@/components/dashboard/EmptyState";
import { listProjects, deleteProject } from "@/lib/db/projects";
import type { Project } from "@/lib/types/project";

export default function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAll = useCallback(async () => {
    const all = await listProjects();
    setProjects(all);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const handleDelete = async (id: string) => {
    await deleteProject(id);
    setProjects((prev) => prev.filter((p) => p.id !== id));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="font-display text-2xl font-bold tracking-tight">
          Your Tutorials
        </h1>
        <Button asChild className="gap-2 rounded-full">
          <Link href="/dashboard/new">
            <Plus className="h-4 w-4" />
            New Tutorial
          </Link>
        </Button>
      </div>

      {projects.length === 0 ? (
        <EmptyState />
      ) : (
        <ProjectGrid projects={projects} onDelete={handleDelete} />
      )}
    </div>
  );
}
