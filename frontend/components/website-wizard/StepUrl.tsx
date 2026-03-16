"use client";

import { useState } from "react";
import { Globe, AlertCircle } from "lucide-react";
import { useWebsiteWizardStore } from "@/lib/store/website-wizard-store";

export function StepUrl() {
  const { url, setUrl, setError, error } = useWebsiteWizardStore();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleChange = (value: string) => {
    setUrl(value);
    setLocalError(null);
    setError(null);
  };

  const handleBlur = () => {
    if (!url.trim()) return;

    try {
      const parsed = new URL(url.startsWith("http") ? url : `https://${url}`);
      if (!["http:", "https:"].includes(parsed.protocol)) {
        setLocalError("URL must use http or https protocol");
      }
    } catch {
      setLocalError("Please enter a valid URL");
    }
  };

  const displayError = localError || error;

  return (
    <div className="flex flex-col items-center gap-8 pt-8">
      {/* Illustration */}
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/10">
        <Globe className="h-10 w-10 text-primary" />
      </div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground">
          Create a Website Showcase Video
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Paste any website URL and we&apos;ll generate a professional motion graphics video
          with animations, stats, and a compelling CTA.
        </p>
      </div>

      {/* URL Input */}
      <div className="w-full max-w-lg">
        <label htmlFor="website-url" className="mb-2 block text-sm font-medium text-foreground">
          Website URL
        </label>
        <div className="relative">
          <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            id="website-url"
            type="url"
            placeholder="https://example.com"
            value={url}
            onChange={(e) => handleChange(e.target.value)}
            onBlur={handleBlur}
            className={`w-full rounded-lg border bg-surface py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 ${
              displayError ? "border-red-500" : "border-border/40"
            }`}
          />
        </div>
        {displayError && (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
            <AlertCircle className="h-3.5 w-3.5" />
            {displayError}
          </p>
        )}
      </div>

      <p className="max-w-md text-center text-xs text-muted-foreground">
        We&apos;ll capture screenshots, extract brand colors, and use AI to generate
        a tailored video script for your website.
      </p>
    </div>
  );
}
