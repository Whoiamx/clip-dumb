export interface VoiceOption {
  id: string;
  name: string;
  accent: string;
  gender: "male" | "female" | "neutral";
  style: string;
  age: string;
  previewUrl: string;
  provider: "elevenlabs";
  multilingual?: boolean;
  nativeLanguage?: string;
  /** Language-specific preview URLs from ElevenLabs verified_languages */
  previewUrls?: Record<string, string>;
}

export interface LanguageOption {
  code: string;
  name: string;
  flag: string;
}
