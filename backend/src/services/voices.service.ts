interface VoiceOption {
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
  previewUrls?: Record<string, string>;
}

// Real ElevenLabs premade voices
const VOICES: VoiceOption[] = [
  { id: "CwhRBWXzGAHq8TQ4Fs17", name: "Roger", accent: "American", gender: "male", age: "Middle-aged", style: "Conversational", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/CwhRBWXzGAHq8TQ4Fs17/58ee3ff5-f6f2-4628-93b8-e38eb31806b0.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "EXAVITQu4vr4xnSDxMaL", name: "Sarah", accent: "American", gender: "female", age: "Young", style: "Soft & Warm", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/EXAVITQu4vr4xnSDxMaL/01a3e33c-6e99-4ee7-8543-ff2216a32186.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "FGY2WhTYpPnrIDTdsKH5", name: "Laura", accent: "American", gender: "female", age: "Young", style: "Upbeat & Social", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/FGY2WhTYpPnrIDTdsKH5/67341759-ad08-41a5-be6e-de12fe448618.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "IKne3meq5aSn9XLyUdCD", name: "Charlie", accent: "Australian", gender: "male", age: "Young", style: "Casual & Natural", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/IKne3meq5aSn9XLyUdCD/102de6f2-22ed-43e0-a1f1-111fa75c5481.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "JBFqnCBsd6RMkjVDRZzb", name: "George", accent: "British", gender: "male", age: "Middle-aged", style: "Narrative & Warm", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/JBFqnCBsd6RMkjVDRZzb/e6206d1a-0721-4787-aafb-06a6e705cac5.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "SAz9YHcvj6GT2YYXdXww", name: "River", accent: "American", gender: "neutral", age: "Middle-aged", style: "Conversational", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/SAz9YHcvj6GT2YYXdXww/e6c95f0b-2227-491a-b3d7-2249240decb7.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "TX3LPaxmHKxFdv7VOQHJ", name: "Liam", accent: "American", gender: "male", age: "Young", style: "Energetic & Articulate", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/TX3LPaxmHKxFdv7VOQHJ/63148076-6363-42db-aea8-31424308b92c.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "Xb7hH8MSUJpSbSDYk0k2", name: "Alice", accent: "British", gender: "female", age: "Middle-aged", style: "Informative & Clear", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/Xb7hH8MSUJpSbSDYk0k2/d10f7534-11f6-41fe-a012-2de1e482d336.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "XrExE9yKIg1WjnnlVkGX", name: "Matilda", accent: "American", gender: "female", age: "Middle-aged", style: "Friendly & Educational", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/XrExE9yKIg1WjnnlVkGX/b930e18d-6b4d-466e-bab2-0ae97c6d8535.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "bIHbv24MWmeRgasZH58o", name: "Will", accent: "American", gender: "male", age: "Young", style: "Friendly & Conversational", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/bIHbv24MWmeRgasZH58o/8caf8f3d-ad29-4980-af41-53f20c72d7a4.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "cgSgspJ2msm6clMCkdW9", name: "Jessica", accent: "American", gender: "female", age: "Young", style: "Conversational & Expressive", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/cgSgspJ2msm6clMCkdW9/56a97bf8-b69b-448f-846c-c3a11683d45a.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "cjVigY5qzO86Huf0OWal", name: "Eric", accent: "American", gender: "male", age: "Middle-aged", style: "Calm & Friendly", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/cjVigY5qzO86Huf0OWal/d098fda0-6456-4030-b3d8-63aa048c9070.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "nPczCjzI2devNBz1zQrb", name: "Brian", accent: "American", gender: "male", age: "Middle-aged", style: "Deep & Narrative", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/nPczCjzI2devNBz1zQrb/2dd3e72c-4fd3-42f1-93ea-abc5d4e5aa1d.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "onwK4e9ZLuTAKqWW03F9", name: "Daniel", accent: "British", gender: "male", age: "Middle-aged", style: "Authoritative & Informative", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/onwK4e9ZLuTAKqWW03F9/7eee0236-1a72-4b86-b303-5dcadc007ba9.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "pFZP5JQG7iQjIQuC4Bku", name: "Lily", accent: "British", gender: "female", age: "Middle-aged", style: "Warm & Narrative", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/pFZP5JQG7iQjIQuC4Bku/89b68b35-b3dd-4348-a84a-a3c13a3c2b30.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
  { id: "pNInz6obpgDQGcFmaJgB", name: "Adam", accent: "American", gender: "male", age: "Middle-aged", style: "Deep & Clear", previewUrl: "https://storage.googleapis.com/eleven-public-prod/premade/voices/pNInz6obpgDQGcFmaJgB/d6905d7a-dd26-4187-bfff-1bd3a5ea7cac.mp3", provider: "elevenlabs", multilingual: true, nativeLanguage: "en" },
];

const SUPPORTED_LANGUAGES = ["en", "es", "fr", "de", "pt", "ja", "ko", "zh"];

export function getVoicesByLanguage(language: string): VoiceOption[] {
  if (!SUPPORTED_LANGUAGES.includes(language)) {
    return VOICES;
  }

  // Native speakers first, then multilingual, exclude unsupported
  const native = VOICES.filter((v) => v.nativeLanguage === language);
  const multilingual = VOICES.filter(
    (v) => v.nativeLanguage !== language && v.multilingual
  );

  return [...native, ...multilingual];
}
