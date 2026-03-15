# ClipDub

Web app to create professional **tutorials** and **product demos** from silent screen recordings. AI analyzes the video, generates narration, adds AI voice, exports polished video — **no microphone needed**.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 — `frontend/`
- **Backend**: Express 5 + TypeScript — `backend/` (port 4000)
- **Styling**: Tailwind CSS v4 (`@theme` in globals.css, NOT tailwind.config)
- **Animations**: GSAP (scroll reveals, hero entrance, floating orbs)
- **Video rendering**: Remotion (render.service.ts currently simulates progress — real Remotion pending)
- **AI**: Anthropic Claude API (`@anthropic-ai/sdk`) for frame analysis & script generation
- **TTS**: ElevenLabs API (`tts.service.ts`, requires `ELEVENLABS_API_KEY`)
- **UI**: Radix UI primitives, Lucide React icons, Zustand state
- **Fonts**: Space Grotesk (display), DM Sans (body), JetBrains Mono (mono) via Google Fonts

## Running the Project

```bash
npm run install:all        # Install all dependencies
npm run dev                # Frontend + backend concurrently
npm run dev:frontend       # http://localhost:3000
npm run dev:backend        # http://localhost:4000
```

## Architecture

Frontend calls backend Express API **directly** (no Next.js API route proxies):
- `NEXT_PUBLIC_API_URL` env var (defaults `http://localhost:4000`)
- Frontend imports `API_URL` from `@/lib/config.ts`
- All `fetch()` calls use `${API_URL}/api/...`

## Project Structure

```
package.json              — Root orchestrator (concurrently)
frontend/                 — Next.js 16 app (React 19)
  app/
    page.tsx              — Landing page (marketing)
    layout.tsx            — Root layout, ThemeProvider, fonts
    globals.css           — Theme tokens (dark/light)
    dashboard/
      layout.tsx          — Sidebar + DashboardHeader + content
      page.tsx            — Project grid from IndexedDB
      new/page.tsx        — Wizard multi-step (new tutorial)
      exports|usage|settings/page.tsx — Placeholder pages
    editor/
      page.tsx            — Standalone editor (legacy)
      [id]/page.tsx       — Editor by project ID, auto-saves 2s
  components/
    dashboard/            — DashboardSidebar, DashboardHeader, ProjectCard, ProjectGrid, EmptyState
    wizard/               — WizardShell, StepIndicator, StepSource, StepSettings, VoicePicker,
                            StepAnalysis, StepScript, StepPreview, StepExport
    editor/               — EditorShell, VideoPreview, Timeline, SubtitleEditor, VideoOutline
    brand/                — ClipDubLogo (SVG logomark + wordmark)
    upload/               — UploadZone (entire zone clickable)
    ui/                   — button, slider (Radix-based)
    ThemeProvider.tsx      — Dark/light theme context
    ThemeToggle.tsx        — Theme switch button
  lib/
    config.ts             — API_URL constant
    types/project.ts      — Project type (Chapter[], TrimRegion[], language?, voiceId?)
    types/voice.ts        — VoiceOption, LanguageOption
    data/voices.ts        — 16 ElevenLabs premade voices + 8 languages
    store/project-store.ts  — Zustand: project + subtitle/chapter/trim CRUD + history
    store/editor-store.ts   — Zustand: playback, selection, panels, AI/export progress
    store/wizard-store.ts   — Zustand: wizard step state (ephemeral)
    store/auth-store.ts     — Zustand: mock auth ("Demo User")
    db/projects.ts          — IndexedDB CRUD + migration
    video/                  — thumbnail.ts, frame-strip.ts
    ai/                     — frame-extractor.ts, prompts.ts, analyze.ts
  remotion/               — Video composition & config
```

### Backend (`backend/`)

```
backend/
  src/
    index.ts                — Express server entry (port 4000)
    routes/
      analyze.ts            — POST /api/analyze-frames
      voices.ts             — GET /api/voices?language=xx
      tts.ts                — POST /api/voice-preview, POST /api/tts
      upload.ts             — POST /api/upload (500MB limit)
      render.ts             — POST /api/render, GET /api/render-status
      languages.ts          — GET /api/languages
    services/
      analyze.service.ts    — Claude Haiku 4.5 frame analysis + tutorial prompts
      voices.service.ts     — 16 ElevenLabs premade voices, language filtering
      tts.service.ts        — ElevenLabs TTS (eleven_flash_v2_5)
      render.service.ts     — Render job manager (simulated progress, real Remotion pending)
  uploads/                  — Uploaded files
  .env.example              — Required env vars
```

## Design System

- **Primary**: `#FF5E3A` (dark) / `#E8451A` (light)
- **Accent**: `#F5C542` (dark) / `#D4A017` (light)
- **Backgrounds**: `#0B0F19` (dark) / `#FAFAF8` (light)
- Colors as CSS custom properties in `globals.css` under `@theme` and `.light`
- Theme classes: `dark` (default) / `light` on `<html>`

## Landing Page (`frontend/app/page.tsx`)

Nav → Hero (split layout) → How It Works (5 alternating rows, ALL visible) → Features (bento grid 6 cards) → Use Cases (2x2 GradientCard) → Why ClipDub (3-col) → Pricing (4-col: Trial $0.99, Plus $19, Teams $49, Pro $199) → Final CTA → Footer

## App Flow

```
Landing (/) → /dashboard → /dashboard/new (wizard) → /editor/[id]
                         ↘ click project card       → /editor/[id]
                         ↘ sidebar nav              → exports | usage | settings
```

- **Dashboard**: Sidebar nav + project grid from IndexedDB. Empty state → CTA.
- **Wizard** (`/dashboard/new`): 6-step (or 3 without narration):
  - With narration: Source → Settings → AI Analysis → Script → Preview → Export
  - Without: Source → Settings → Export
  - Language in Step 2 → sent to AI so scripts generate in correct language
  - Step 4: Skip Silences, Voice Settings, Download .srt, editable timestamps
  - Step 5: Mini-editor with subtitle panel, timeline, trim regions
  - Step 6: Quality selector + export/save
- **Editor** (`/editor/[id]`): Load from IndexedDB, auto-save 2s. Breadcrumb nav. Tabs: Subtitles, Outline, Device, Export.
- **Auth**: Mock only (hardcoded "Demo User").

## Voices & TTS

- 16 real ElevenLabs premade voices with real IDs and CDN preview URLs
- `VoiceOption`: `multilingual`, `nativeLanguage`, `previewUrls` (language → URL map)
- `GET /api/voices?language=xx`: native speakers first, multilingual second, unsupported excluded
- VoicePicker preview priority: `previewUrls[lang]` → `previewUrl` → TTS fallback (`POST /api/voice-preview`)
- Audio cached as blob URLs per voice+language
- TTS fallback uses `eleven_flash_v2_5` with explicit `language_code`, streams MP3

## Data Model

- **Chapter**: `id`, `title`, `startFrame`, `endFrame`, `subtitleIds[]` — references flat `subtitles[]` array
- **TrimRegion**: `id`, `startFrame`, `endFrame` — red striped overlays in Timeline
- **SubtitleStyle**: `textAlign`, `outlineColor`, `outlineWidth`, font family selector
- Old projects get defaults via migration in `db/projects.ts`

## AI Analysis Pipeline

1. **Frame extraction** (client-side): `frame-extractor.ts` captures frames at 2s intervals via `<canvas>` → base64 JPEG
2. **API call**: `POST /api/analyze-frames` with frames + language
3. **Backend** (planned): Claude Haiku 4.5 with presenter-style narration prompt (conversational, explains WHY, addresses viewer)
4. **Response**: `{ chapters: [{ title, subtitles: [{ text, frameIndex, durationFrames, animation }] }] }`
5. Parsed into `SubtitleEntry[]` + `Chapter[]` → `useProjectStore`

## Key Conventions

- Tailwind classes with theme tokens (`bg-primary`, `text-muted-foreground`)
- Landing page: `data-reveal` + `data-stagger-group`/`data-stagger-item` for GSAP animations
- Path alias: `@/*` → `frontend/` root
- Frontend → backend direct (no Next.js API proxies)
- `GradientCard` for hover gradient border effect
- Step illustrations: self-contained `StepIllustration*` components

## Known Issues

- `VideoPreview.tsx:26`: TS error with Remotion's `addEventListener` type (pre-existing)
- `remotion/index.ts`: pre-existing TSX/TS config errors (no runtime impact)
- `durationInFrames`: consumers guard against `Infinity`, fallback 300 frames. WebM uses seek-to-end workaround.
- Skip Silences toggle: UI-only, no backend yet

## Important Preferences

- **DO NOT** copy layouts from reference images — designs must be original
- Minimum text: `text-xs` (12px) secondary, `text-sm` (14px) body, `text-base`+ headings. Never `< 12px`
- Workflow steps: ALL visible at once (no accordion/tabs)
- Copy emphasis: tutorials without mic, app/product demos, screen recordings as input
- **DO NOT** modify `globals.css` unless explicitly asked
