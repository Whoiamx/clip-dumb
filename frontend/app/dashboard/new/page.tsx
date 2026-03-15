"use client";

import { useEffect } from "react";
import { nanoid } from "nanoid";
import { useProjectStore } from "@/lib/store/project-store";
import { useWizardStore } from "@/lib/store/wizard-store";
import { WizardShell } from "@/components/wizard/WizardShell";
import {
  DEFAULT_COMPOSITION,
  DEFAULT_EXPORT,
} from "@/lib/types/project";

export default function NewTutorialPage() {
  useEffect(() => {
    // Create fresh project
    useProjectStore.getState().setProject({
      id: nanoid(),
      name: "Untitled Project",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      video: null,
      composition: { ...DEFAULT_COMPOSITION },
      subtitles: [],
      exportSettings: { ...DEFAULT_EXPORT },
    });

    // Reset wizard state
    useWizardStore.getState().reset();
  }, []);

  return <WizardShell />;
}
