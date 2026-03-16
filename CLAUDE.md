# ClipDub

Web app to create professional **tutorials** and **product demos** from silent screen recordings. AI analyzes the video, generates narration, adds AI voice, exports polished video — **no microphone needed**.

## Tech Stack

- **Frontend**: Next.js 16 (App Router) + React 19 — `frontend/`
- **Backend**: Express 5 + TypeScript — `backend/` (port 4000)
- **Auth**: Supabase Auth (email+password + Google OAuth) — `@supabase/ssr`
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
- `SUPABASE_URL` — Supabase project URL (required for auth)
- `SUPABASE_SERVICE_ROLE_KEY` — Supabase service role key (required for auth)

Frontend requires a `.env.local` file in `frontend/`:
- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon/public key

## Architecture

Frontend calls backend Express API **directly** (no Next.js API route proxies):
- `NEXT_PUBLIC_API_URL` env var (defaults `http://localhost:4000`)
- Frontend imports `apiFetch` from `@/lib/api-fetch.ts` — automatically attaches Supabase auth token
- All API calls use `apiFetch("/api/...", { ... })` (NOT raw `fetch` with `API_URL`)
- Backend CORS restricted to `localhost:3000` and `localhost:3001`

## Project Structure

```
package.json              — Root orchestrator (concurrently)
frontend/                 — Next.js 16 app (React 19)
  middleware.ts            — Route protection (redirects to /login if unauthenticated)
  app/
    page.tsx              — Landing page (marketing)
    layout.tsx            — Root layout, ThemeProvider, AuthInitializer, fonts
    globals.css           — Theme tokens (dark/light)
    login/page.tsx        — Login/signup page (Supabase Auth)
    auth/callback/route.ts — OAuth code exchange route handler
    dashboard/
      layout.tsx          — Sidebar + DashboardHeader + content
      page.tsx            — Project grid from IndexedDB
      new/page.tsx        — Wizard multi-step (new tutorial)
      exports|usage|settings/page.tsx — Placeholder pages
    editor/
      page.tsx            — Standalone editor (legacy)
      [id]/page.tsx       — Editor by project ID, auto-saves 2s
  components/
    AuthInitializer.tsx   — Bootstraps Supabase auth state on mount
    ThemeProvider.tsx      — Dark/light theme context
    ThemeToggle.tsx        — Theme switch button
    brand/                — ClipDubLogo (SVG logomark + wordmark)
    dashboard/            — DashboardSidebar, DashboardHeader, ProjectCard, ProjectGrid, EmptyState
    wizard/               — WizardShell, StepIndicator, StepSource, StepSettings, VoicePicker,
                            StepAnalysis, StepScript, StepPreview, StepExport
    editor/               — EditorShell, VideoPreview, Timeline, SubtitleEditor, VideoOutline,
                            ExportPanel, DeviceMockupPicker, ScreenRecorder
    upload/               — UploadZone (entire zone clickable)
    ui/                   — button, slider (Radix-based)
  lib/
    config.ts             — API_URL constant
    api-fetch.ts          — Authenticated fetch wrapper (attaches Supabase token)
    utils.ts              — cn() utility (clsx + tailwind-merge)
    supabase/client.ts    — Browser Supabase client (createBrowserClient)
    supabase/server.ts    — Server Supabase client with cookies
    supabase/middleware.ts — Session refresh + route protection redirects
    types/project.ts      — Project type (Chapter[], TrimRegion[], language?, voiceId?)
    types/voice.ts        — VoiceOption, LanguageOption
    data/voices.ts        — 16 ElevenLabs premade voices + 8 languages
    store/project-store.ts  — Zustand: project + subtitle/chapter/trim CRUD + history
    store/editor-store.ts   — Zustand: playback, selection, panels, AI/export progress
    store/wizard-store.ts   — Zustand: wizard step state (ephemeral)
    store/auth-store.ts     — Zustand: Supabase auth (getUser, onAuthStateChange, signOut)
    db/projects.ts          — IndexedDB CRUD + migration
    video/                  — thumbnail.ts, frame-strip.ts, media-recorder.ts, screen-capture.ts, trim-mapping.ts
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
    middleware/
      auth.ts               — requireAuth middleware (validates Supabase JWT + provider match)
      admin.ts              — requireAdmin middleware
      usage-logger.ts       — API usage logging middleware
    routes/
      analyze.ts            — POST /api/analyze-frames (protected)
      voices.ts             — GET /api/voices?language=xx (public)
      tts.ts                — POST /api/voice-preview, POST /api/tts (protected)
      upload.ts             — POST /api/upload, 500MB limit (protected)
      render.ts             — POST /api/render, GET /api/render-status (protected)
      languages.ts          — GET /api/languages (public)
      auth-check.ts         — POST /api/auth/check-provider (public)
      me.ts                 — GET /api/auth/me (protected)
      admin.ts              — Admin routes (protected + admin only)
    services/
      analyze.service.ts    — Claude Sonnet 4.5 frame analysis + tutorial prompts
      voices.service.ts     — 16 ElevenLabs premade voices, language filtering
      tts.service.ts        — ElevenLabs TTS (eleven_flash_v2_5)
      render.service.ts     — Render job manager (simulated progress, real Remotion pending)
      admin.service.ts      — Admin dashboard data queries
  uploads/                  — Uploaded files
  .env.example              — Required env vars template
```

### Database (`supabase/`)

```
supabase/
  migrations/
    001_admin_tables.sql    — user_roles, subscriptions, api_usage_logs, projects_metadata + RLS
    002_auth_provider.sql   — auth_provider column, check_auth_provider RPC, on_auth_user_created trigger
  seed-admin.sql            — Seeds admin role for gaastontimchuk@gmail.com
```

## Design System

- **Primary**: `#FF5E3A` (dark) / `#E8451A` (light)
- **Accent**: `#F5C542` (dark) / `#D4A017` (light)
- **Backgrounds**: `#0B0F19` (dark) / `#FAFAF8` (light)
- Colors as CSS custom properties in `globals.css` under `@theme` and `.light`
- Theme classes: `dark` (default) / `light` on `<html>`

## Landing Page (`frontend/app/page.tsx`)

Nav → Hero (split layout) → How It Works (5 alternating rows, ALL visible) → Features (bento grid 6 cards) → Use Cases (2x2 GradientCard) → Why ClipDub (3-col) → Pricing (4-col: Trial $0.99, Plus $19, Teams $49, Pro $199) → Final CTA → Footer

## Auth System

### Flow
```
/ (public) → /login → email+password or Google OAuth → /dashboard (protected)
                     ↘ sign up → "Check your email" confirmation
```

### Auth Provider Enforcement
- **Cross-provider login blocked**: if you registered with Google, you can't login with email+password (and vice versa)
- `user_roles` table has `auth_provider` column (`'email'` | `'google'`), auto-populated by `on_auth_user_created` trigger on `auth.users`
- **Pre-check** (frontend login page): calls `POST /api/auth/check-provider` with `{ email, method }` before `signInWithPassword`/`signUp`
- **Post-check** (OAuth callback): after `exchangeCodeForSession`, verifies `auth_provider === 'google'` in `user_roles`; signs out + redirects on mismatch
- **Backend defense-in-depth**: `requireAuth` middleware compares token's `app_metadata.provider` with `user_roles.auth_provider`
- **Generic errors**: all auth errors show "Invalid credentials or authentication method." — never reveals email existence or registered provider
- `check_auth_provider` RPC (SECURITY DEFINER) returns only `{ allowed: boolean }`, never the provider
- **Important**: "Auto-link accounts" must be disabled in Supabase Dashboard (Authentication > Providers)

### Frontend Auth
- **Middleware** (`frontend/middleware.ts`): calls `updateSession()` from `@/lib/supabase/middleware.ts`
  - Unauthenticated on `/dashboard/**` or `/editor/**` → redirect to `/login`
  - Authenticated on `/login` → redirect to `/dashboard`
- **Login page** (`/login`): email+password sign in/up toggle + Google OAuth button
  - Google OAuth uses `supabase.auth.signInWithOAuth()` → `/auth/callback` → `/dashboard`
  - Pre-check provider before any Supabase auth call
  - Error params from URL sanitized against phishing
- **Auth store** (`auth-store.ts`): Zustand store with `initialize()`, `logout()`, `onAuthStateChange` subscription (with cleanup to prevent memory leaks)
  - User type includes `authProvider: 'email' | 'google'` (from `app_metadata.provider`)
- **AuthInitializer** component: mounted in root layout, calls `initialize()` once
- **`apiFetch()`** (`api-fetch.ts`): wraps `fetch()`, automatically reads Supabase session and attaches `Authorization: Bearer <token>` header

### Backend Auth
- **`requireAuth` middleware** (`backend/src/middleware/auth.ts`): reads `Authorization: Bearer <token>`, validates via `supabase.auth.getUser(token)` with service role key, verifies auth provider match, attaches `req.user` with `{ id, email, role }`
- **Protected routes**: analyze-frames, tts, voice-preview, upload, render, render-status, me
- **Public routes**: voices, languages, health, auth/check-provider

### Google OAuth Avatar
- Avatar URL extracted from `user_metadata.avatar_url` or `user_metadata.picture`
- `<img>` tags use `referrerPolicy="no-referrer"` and `crossOrigin="anonymous"` to load Google profile images (`lh3.googleusercontent.com`) without COEP blocking

## App Flow

```
Landing (/) → /login → /dashboard → /dashboard/new (wizard) → /editor/[id]
                                   ↘ click project card       → /editor/[id]
                                   ↘ sidebar nav              → exports | usage | settings
```

- **Dashboard**: Sidebar nav + project grid from IndexedDB. Empty state → CTA. User avatar/email/name + logout button in sidebar (desktop) and header (mobile).
- **Wizard** (`/dashboard/new`): 6-step (or 3 without narration):
  - With narration: Source → Settings → AI Analysis → Script → Preview → Export
  - Without: Source → Settings → Export
  - Language in Step 2 → sent to AI so scripts generate in correct language
  - Step 4: Skip Silences, Voice Settings, Download .srt, editable timestamps
  - Step 5: Mini-editor with subtitle panel, timeline (smart lane layout), trim regions
  - Step 6: Quality selector + export/save
- **Editor** (`/editor/[id]`): Load from IndexedDB, auto-save 2s. Breadcrumb nav. Tabs: Subtitles, Outline, Device, Export.

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
- Projects stored in IndexedDB (Supabase DB migration planned for phase 2)

## AI Analysis Pipeline

1. **Frame extraction** (client-side): `frame-extractor.ts` captures frames at 2s intervals via `<canvas>` → base64 JPEG
2. **API call**: `POST /api/analyze-frames` with `{ frames, fps, language, videoDurationInFrames }` (authenticated via `apiFetch`)
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
- Frontend → backend direct (no Next.js API proxies), all calls via `apiFetch()` with auth token
- `GradientCard` for hover gradient border effect
- Step illustrations: self-contained `StepIllustration*` components

## Known Issues

- `VideoPreview.tsx:26`: TS error with Remotion's `addEventListener` type (pre-existing)
- `remotion/index.ts`: pre-existing TSX/TS config errors (no runtime impact)
- `durationInFrames`: consumers guard against `Infinity`, fallback 300 frames. WebM uses seek-to-end workaround.
- Skip Silences toggle: UI-only, no backend yet
- Render service: simulates progress, does not produce real MP4 yet
- Next.js 16 warns that `middleware` is deprecated in favor of `proxy` — functional, migration deferred

## Important Preferences

- **DO NOT** copy layouts from reference images — designs must be original
- Minimum text: `text-xs` (12px) secondary, `text-sm` (14px) body, `text-base`+ headings. Never `< 12px`
- Workflow steps: ALL visible at once (no accordion/tabs)
- Copy emphasis: tutorials without mic, app/product demos, screen recordings as input
- **DO NOT** modify `globals.css` unless explicitly asked
