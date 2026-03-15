# ClipDub

Web app to create professional **tutorials** and **product demos** from silent screen recordings. AI analyzes the video, generates narration, adds AI voice, exports polished video — **no microphone needed**.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 — `frontend/`
- **Backend**: Express 5 + TypeScript — `backend/` (port 4000)
- **Styling**: Tailwind CSS v4 (`@theme` in globals.css, NOT tailwind.config)
- **Animations**: GSAP (scroll reveals, hero entrance, floating orbs)
- **Video rendering**: Remotion (render.service.ts currently simulates progress — real Remotion pending)
- **AI**: Anthropic Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) for frame analysis & script generation
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

### Environment Variables

Backend requires a `.env` file in `backend/` (see `backend/.env.example`):
- `ANTHROPIC_API_KEY` — Claude API key (required for AI analysis)
- `ELEVENLABS_API_KEY` — ElevenLabs API key (required for TTS)
- `PORT` — Server port (default 4000)

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
    editor/               — EditorShell, VideoPreview, Timeline, SubtitleEditor, VideoOutline,
                            ExportPanel, DeviceMockupPicker, ScreenRecorder
    brand/                — ClipDubLogo (SVG logomark + wordmark)
    upload/               — UploadZone (entire zone clickable)
    ui/                   — button, slider (Radix-based)
    ThemeProvider.tsx      — Dark/light theme context
    ThemeToggle.tsx        — Theme switch button
  lib/
    config.ts             — API_URL constant
    utils.ts              — cn() utility (clsx + tailwind-merge)
    types/project.ts      — Project type (Chapter[], TrimRegion[], language?, voiceId?)
    types/voice.ts        — VoiceOption, LanguageOption
    data/voices.ts        — 16 ElevenLabs premade voices + 8 languages
    store/project-store.ts  — Zustand: project + subtitle/chapter/trim CRUD + history
    store/editor-store.ts   — Zustand: playback, selection, panels, AI/export progress
    store/wizard-store.ts   — Zustand: wizard step state (ephemeral)
    store/auth-store.ts     — Zustand: mock auth ("Demo User")
    db/projects.ts          — IndexedDB CRUD + migration
    video/                  — thumbnail.ts, frame-strip.ts, media-recorder.ts, screen-capture.ts
    ai/                     — frame-extractor.ts, prompts.ts, analyze.ts (client-side fallback)
  remotion/
    index.ts              — Remotion entry + composition config
    ShowcaseVideo.tsx     — Main video composition
    components/           — AnimatedSubtitle, BackgroundGradient, DeviceMockup, FeatureHighlight
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
      analyze.service.ts    — Claude Sonnet 4.5 frame analysis + tutorial prompts
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
  - Step 5: Mini-editor with subtitle panel, timeline (smart lane layout), trim regions
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
2. **API call**: `POST /api/analyze-frames` with `{ frames, fps, language, videoDurationInFrames }`
3. **Backend**: Claude Sonnet 4.5 (`claude-sonnet-4-5-20250929`) with tutorial-style system prompt
4. **Prompt style**: Imperative mode only (ACTION + UI ELEMENT). Never passive narration. Language-aware (Spanish/English examples baked in).
5. **Post-processing**: Server-side sanitization — clamp duration 2-4s, fix overlaps, cap to video duration
6. **Response**: `{ subtitles: SubtitleEntry[], chapters: Chapter[] }`
7. Parsed into `useProjectStore`

### AI Prompt Rules (analyze.service.ts)

- Each subtitle = one user action + specific interface element
- Imperative verbs: Click, Select, Type, Enter, Toggle, Drag, Scroll, Hover, Open/Close
- Single flow only — no alternative paths
- Never describe system behavior ("Se abre...", "The system shows...")
- 2-5 chapters per video, no overlapping subtitles
- frameIndex × 2 = seconds (frames captured every 2s). frameIndex 3 = 00:00:06,000 NOT 00:06:00,000

### SRT Export

- `StepScript.tsx` has Download Script button that generates `.srt` file
- Format: `HH:MM:SS,mmm` (e.g., `00:00:06,000` for 6 seconds)
- Frame-to-SRT conversion: `formatSrtTime()` in StepScript.tsx

## Timeline

- **Smart lane layout**: Subtitles assigned to lanes based on time overlap (non-overlapping share lanes)
- **Dynamic height**: Track area grows based on number of lanes needed
- **Auto-fit zoom**: On mount, calculates zoom to fit full video duration in view
- **Drag interactions**: Move subtitles, resize start/end, selection range, trim regions
- **Time markers**: Clean `M:SS` format (e.g., `0:06`, `1:30`)

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
- Render service: simulates progress, does not produce real MP4 yet

## Important Preferences

- **DO NOT** copy layouts from reference images — designs must be original
- Minimum text: `text-xs` (12px) secondary, `text-sm` (14px) body, `text-base`+ headings. Never `< 12px`
- Workflow steps: ALL visible at once (no accordion/tabs)
- Copy emphasis: tutorials without mic, app/product demos, screen recordings as input
- **DO NOT** modify `globals.css` unless explicitly asked
