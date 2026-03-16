"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { Play, Square, Loader2, User, Volume2, AlertCircle } from "lucide-react";
import { VOICES, LANGUAGES } from "@/lib/data/voices";
import type { VoiceOption } from "@/lib/types/voice";
import { apiFetch } from "@/lib/api-fetch";

interface VoicePickerProps {
  selectedVoiceId: string;
  onSelect: (voiceId: string) => void;
  language?: string;
}

// Audio blob cache: cacheKey → Blob URL (persists across re-renders)
const audioCache = new Map<string, string>();

function getLanguageName(code: string): string {
  return LANGUAGES.find((l) => l.code === code)?.name || code;
}

/**
 * Get the best preview URL for a voice in the given language.
 * Priority: previewUrls[language] > previewUrl (default/English) > TTS fallback
 */
function getPreviewUrl(voice: VoiceOption, language: string): string | null {
  // Check language-specific preview from ElevenLabs verified_languages
  if (voice.previewUrls?.[language]) {
    return voice.previewUrls[language];
  }
  // For English or if no language-specific preview, use default
  if (language === "en" && voice.previewUrl) {
    return voice.previewUrl;
  }
  // No static preview available for this language — will use TTS fallback
  return null;
}

export function VoicePicker({ selectedVoiceId, onSelect, language = "en" }: VoicePickerProps) {
  const [voices, setVoices] = useState<VoiceOption[]>(VOICES);
  const [loadError, setLoadError] = useState(false);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch voices from backend filtered by language
  useEffect(() => {
    let cancelled = false;

    apiFetch(`/api/voices?language=${encodeURIComponent(language)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch voices");
        return res.json();
      })
      .then((data) => {
        if (!cancelled && data.voices?.length > 0) {
          setVoices(data.voices);
          setLoadError(false);

          const ids = new Set(data.voices.map((v: VoiceOption) => v.id));
          if (!ids.has(selectedVoiceId)) {
            onSelect(data.voices[0].id);
          }
        }
      })
      .catch(() => {
        if (!cancelled) {
          setVoices(VOICES);
          setLoadError(false);
        }
      });
    return () => { cancelled = true; };
  }, [language]); // eslint-disable-line react-hooks/exhaustive-deps

  // Stop playback when language changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlayingId(null);
    setLoadingId(null);
  }, [language]);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setPlayingId(null);
  }, []);

  const playBlobUrl = useCallback((blobUrl: string, voiceId: string) => {
    const audio = new Audio(blobUrl);
    audioRef.current = audio;
    setPlayingId(voiceId);
    setLoadingId(null);
    audio.onended = () => setPlayingId(null);
    audio.onerror = () => { setPlayingId(null); setLoadingId(null); };
    audio.play();
  }, []);

  const handlePreview = useCallback(async (voice: VoiceOption) => {
    if (playingId === voice.id) {
      stopPlayback();
      return;
    }
    stopPlayback();

    const staticUrl = getPreviewUrl(voice, language);
    const cacheKey = staticUrl
      ? `static:${staticUrl}`
      : `tts:${voice.id}:${language}`;

    // Check cache
    const cached = audioCache.get(cacheKey);
    if (cached) {
      playBlobUrl(cached, voice.id);
      return;
    }

    setLoadingId(voice.id);

    try {
      let blob: Blob;

      if (staticUrl) {
        // Use ElevenLabs CDN preview (language-specific or default English)
        const res = await fetch(staticUrl);
        if (!res.ok) throw new Error("Preview not available");
        blob = await res.blob();
      } else {
        // Fallback: generate via TTS for languages without a static preview
        const res = await apiFetch("/api/voice-preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ voiceId: voice.id, language }),
        });
        if (!res.ok) throw new Error("Preview generation failed");
        blob = await res.blob();
      }

      const blobUrl = URL.createObjectURL(blob);
      audioCache.set(cacheKey, blobUrl);
      playBlobUrl(blobUrl, voice.id);
    } catch {
      setLoadingId(null);
    }
  }, [playingId, stopPlayback, playBlobUrl, language]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  if (voices.length === 0 || loadError) {
    return (
      <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/30 p-6">
        <AlertCircle className="h-5 w-5 shrink-0 text-muted-foreground" />
        <div>
          <p className="text-sm font-medium">Voices unavailable</p>
          <p className="text-xs text-muted-foreground">
            No voices available for this language. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  // Split into native and multilingual groups
  const nativeVoices = voices.filter((v) => v.nativeLanguage === language);
  const multilingualVoices = voices.filter((v) => v.nativeLanguage !== language);
  const showGroups = nativeVoices.length > 0 && multilingualVoices.length > 0;

  const renderVoiceCard = (voice: VoiceOption) => {
    const isSelected = voice.id === selectedVoiceId;
    const isPlaying = playingId === voice.id;
    const isLoading = loadingId === voice.id;
    const hasLanguagePreview = !!getPreviewUrl(voice, language) || voice.multilingual;

    return (
      <button
        key={voice.id}
        onClick={() => onSelect(voice.id)}
        className={`flex flex-col gap-2 rounded-xl border p-3 text-left transition-all ${
          isSelected
            ? "border-primary/50 bg-primary/10 ring-2 ring-primary"
            : "border-border/50 bg-card/30 hover:border-border hover:bg-card/50"
        }`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full ${
                isSelected ? "bg-primary/20" : "bg-muted/40"
              }`}
            >
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-semibold">{voice.name}</span>
          </div>
          {hasLanguagePreview && (
            <div
              role="button"
              tabIndex={0}
              className={`flex h-7 w-7 items-center justify-center rounded-full transition-all ${
                isPlaying
                  ? "bg-primary text-white animate-pulse"
                  : isLoading
                    ? "bg-muted/60 text-muted-foreground"
                    : isSelected
                      ? "bg-primary text-white hover:bg-primary/80"
                      : "bg-muted/40 text-muted-foreground hover:bg-muted/60 hover:text-foreground"
              }`}
              onClick={(e) => {
                e.stopPropagation();
                handlePreview(voice);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.stopPropagation();
                  handlePreview(voice);
                }
              }}
              title={isPlaying ? "Stop preview" : `Preview voice in ${getLanguageName(language)}`}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : isPlaying ? (
                <Square className="h-2.5 w-2.5 fill-current" />
              ) : (
                <Play className="ml-0.5 h-3 w-3" />
              )}
            </div>
          )}
        </div>
        <div className="flex flex-wrap gap-1">
          <span className="rounded-md bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {voice.accent}
          </span>
          <span className="rounded-md bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {voice.gender}
          </span>
          <span className="rounded-md bg-muted/30 px-1.5 py-0.5 text-[10px] text-muted-foreground">
            {voice.style}
          </span>
        </div>
        {isPlaying && (
          <div className="flex items-center gap-1.5 text-[10px] font-medium text-primary">
            <Volume2 className="h-3 w-3" />
            Playing preview...
          </div>
        )}
      </button>
    );
  };

  if (showGroups) {
    return (
      <div className="flex flex-col gap-4">
        <div>
          <p className="mb-2 text-xs font-medium text-primary">
            {getLanguageName(language)} voices
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {nativeVoices.map(renderVoiceCard)}
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-muted-foreground">
            Multilingual voices
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {multilingualVoices.map(renderVoiceCard)}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {voices.map(renderVoiceCard)}
    </div>
  );
}
