const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

const LANGUAGE_CODES: Record<string, string> = {
  en: "en",
  es: "es",
  fr: "fr",
  de: "de",
  pt: "pt",
  ja: "ja",
  ko: "ko",
  zh: "zh",
};

const PREVIEW_TEXTS: Record<string, string> = {
  en: "Welcome to the tutorial. Let me show you how this works step by step.",
  es: "Bienvenido al tutorial. Permíteme mostrarte cómo funciona paso a paso.",
  fr: "Bienvenue dans le tutoriel. Laissez-moi vous montrer comment cela fonctionne étape par étape.",
  de: "Willkommen zum Tutorial. Lassen Sie mich Ihnen Schritt für Schritt zeigen, wie das funktioniert.",
  pt: "Bem-vindo ao tutorial. Deixe-me mostrar como isso funciona passo a passo.",
  ja: "チュートリアルへようこそ。順を追って使い方をご紹介します。",
  ko: "튜토리얼에 오신 것을 환영합니다. 단계별로 사용 방법을 알려드리겠습니다.",
  zh: "欢迎来到教程。让我一步一步地向您展示它是如何工作的。",
};

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not configured");
  return key;
}

export async function generateVoicePreview(
  voiceId: string,
  language: string
): Promise<Buffer> {
  const text = PREVIEW_TEXTS[language] || PREVIEW_TEXTS.en;
  const languageCode = LANGUAGE_CODES[language] || "en";

  const res = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${encodeURIComponent(voiceId)}/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": getApiKey(),
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_flash_v2_5",
        language_code: languageCode,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs API error: ${res.status} - ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

export async function generateTTS(
  text: string,
  voiceId: string,
  language: string
): Promise<Buffer> {
  const languageCode = LANGUAGE_CODES[language] || "en";

  const res = await fetch(
    `${ELEVENLABS_API_URL}/text-to-speech/${encodeURIComponent(voiceId)}/stream`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": getApiKey(),
      },
      body: JSON.stringify({
        text,
        model_id: "eleven_flash_v2_5",
        language_code: languageCode,
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`ElevenLabs API error: ${res.status} - ${err}`);
  }

  const arrayBuffer = await res.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
