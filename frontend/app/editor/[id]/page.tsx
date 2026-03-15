"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "next/navigation";
import { useProjectStore } from "@/lib/store/project-store";
import { loadProject, saveProject } from "@/lib/db/projects";
import { EditorShell } from "@/components/editor/EditorShell";
import { Loader2 } from "lucide-react";
import Link from "next/link";

export default function EditorByIdPage() {
  const params = useParams();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    const load = async () => {
      const project = await loadProject(id);
      if (!project) {
        setError("Project not found");
        setLoading(false);
        return;
      }
      useProjectStore.getState().setProject(project);
      setLoading(false);
    };
    load();
  }, [id]);

  // Auto-save with debounce
  const handleAutoSave = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const current = useProjectStore.getState().project;
      if (current.id === id) {
        saveProject(current);
      }
    }, 2000);
  }, [id]);

  useEffect(() => {
    const unsub = useProjectStore.subscribe(handleAutoSave);
    return () => {
      unsub();
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [handleAutoSave]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-background">
        <p className="text-sm text-muted-foreground">{error}</p>
        <Link
          href="/dashboard"
          className="text-sm text-primary hover:underline"
        >
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return <EditorShell />;
}
