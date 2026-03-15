"use client";

import { Film } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
        <Film className="h-8 w-8 text-primary/60" />
      </div>
      <h2 className="font-display text-xl font-semibold">No tutorials yet</h2>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Create your first tutorial from a screen recording. AI will generate the
        narration script and voice for you.
      </p>
      <Button asChild className="mt-6 rounded-full px-6">
        <Link href="/dashboard/new">Create your first tutorial</Link>
      </Button>
    </div>
  );
}
