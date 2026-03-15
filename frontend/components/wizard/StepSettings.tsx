"use client";

import { useWizardStore } from "@/lib/store/wizard-store";
import { LANGUAGES } from "@/lib/data/voices";
import { VoicePicker } from "./VoicePicker";
import { Globe, Type, MessageSquare } from "lucide-react";

export function StepSettings() {
  const { title, language, voiceId, needsSubtitles, setTitle, setLanguage, setVoiceId, setNeedsSubtitles } =
    useWizardStore();

  return (
    <div className="flex flex-col gap-8">
      <div className="text-center">
        <h2 className="font-display text-xl font-semibold">
          Configure your tutorial
        </h2>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Set a title, language, and choose the AI voice for narration
        </p>
      </div>

      {/* Title */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Type className="h-4 w-4 text-primary" />
          Title
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="My Tutorial"
          className="w-full rounded-xl border border-border/50 bg-card/30 px-4 py-3 text-sm outline-none transition-all placeholder:text-muted-foreground/40 focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Language */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Globe className="h-4 w-4 text-primary" />
          Output Language
        </label>
        <div className="grid grid-cols-4 gap-2">
          {LANGUAGES.map((lang) => (
            <button
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-sm transition-all ${
                language === lang.code
                  ? "border-primary/50 bg-primary/10 ring-2 ring-primary"
                  : "border-border/50 bg-card/30 hover:border-border hover:bg-card/50"
              }`}
            >
              <span className="text-base">{lang.flag}</span>
              <span className="truncate text-xs font-medium">{lang.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Subtitles toggle */}
      <div>
        <label className="mb-2 flex items-center gap-2 text-sm font-medium">
          <MessageSquare className="h-4 w-4 text-primary" />
          AI Narration & Subtitles
        </label>
        <button
          onClick={() => setNeedsSubtitles(!needsSubtitles)}
          className={`flex w-full items-center justify-between rounded-xl border px-4 py-3.5 text-left transition-all ${
            needsSubtitles
              ? "border-primary/50 bg-primary/10 ring-2 ring-primary"
              : "border-border/50 bg-card/30 hover:border-border hover:bg-card/50"
          }`}
        >
          <div>
            <p className="text-sm font-medium">
              {needsSubtitles ? "Enabled" : "Disabled"}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {needsSubtitles
                ? "AI will generate a narration script with subtitles for your tutorial"
                : "Export video without narration or subtitles"}
            </p>
          </div>
          <div
            className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
              needsSubtitles ? "bg-primary" : "bg-muted/50"
            }`}
          >
            <div
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                needsSubtitles ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </div>
        </button>
      </div>

      {/* Voice (only when subtitles enabled) */}
      {needsSubtitles && (
        <div>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium">
            AI Voice
          </label>
          <VoicePicker selectedVoiceId={voiceId} onSelect={setVoiceId} language={language} />
        </div>
      )}
    </div>
  );
}
