"use client";

import { useRef, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import {
  Upload,
  Monitor,
  Sparkles,
  Download,
  Play,
  ArrowRight,
  Clapperboard,
  FileVideo,
  Brain,
  Mic2,
  Globe2,
  Headphones,
  Layers,
  SlidersHorizontal,
  Film,
  Zap,
  Share2,
  CheckCircle,
  Check,
  Users,
  Shield,
  Clock,
  Star,
} from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ClipDubLogo } from "@/components/brand/ClipDubLogo";

/* ─────────────────────────────────────────────
   Workflow step mini-illustrations
   ───────────────────────────────────────────── */

function StepIllustrationUpload() {
  return (
    <div className="step-mockup w-full p-6 sm:p-8">
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 px-6 py-10">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
          <Upload className="h-7 w-7 text-primary" />
        </div>
        <p className="font-display text-sm font-semibold">
          Drop your video here
        </p>
        <p className="mt-1.5 text-xs text-muted-foreground">
          MP4, WebM, MOV up to 500MB
        </p>
        <div className="mt-4 flex gap-2">
          {["recording.mp4", "demo.webm"].map((f) => (
            <div
              key={f}
              className="flex items-center gap-1.5 rounded-md bg-muted/50 px-3 py-1.5 text-xs text-muted-foreground"
            >
              <FileVideo className="h-3 w-3 text-primary/60" />
              {f}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StepIllustrationScript() {
  return (
    <div className="step-mockup w-full p-6 sm:p-8">
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-accent" />
          <span className="font-display text-sm font-semibold">
            AI Script Generation
          </span>
          <span className="ml-auto rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-medium text-accent">
            Analyzing...
          </span>
        </div>
        {[
          { time: "0:00", text: "Welcome to our new dashboard" },
          { time: "0:04", text: "Click on the analytics tab" },
          { time: "0:09", text: "Filter data by date range" },
          { time: "0:14", text: "Export reports in PDF or CSV" },
        ].map((line) => (
          <div
            key={line.time}
            className="flex gap-3 rounded-lg bg-muted/30 px-3 py-2"
          >
            <span className="shrink-0 font-mono text-xs text-primary/60">
              {line.time}
            </span>
            <span className="text-sm leading-relaxed">{line.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepIllustrationVoice() {
  return (
    <div className="step-mockup w-full p-6 sm:p-8">
      <div className="flex flex-col gap-3">
        <span className="font-display text-sm font-semibold">Select Voice</span>
        <div className="grid grid-cols-2 gap-2">
          {[
            { name: "Sarah", lang: "English (US)", active: true },
            { name: "James", lang: "English (UK)", active: false },
            { name: "Elena", lang: "Spanish", active: false },
            { name: "Lucas", lang: "Portuguese (BR)", active: false },
          ].map((v) => (
            <div
              key={v.name}
              className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition-all ${
                v.active
                  ? "bg-primary/10 ring-1 ring-primary/30"
                  : "bg-muted/30"
              }`}
            >
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                  v.active
                    ? "bg-primary text-white"
                    : "bg-muted text-muted-foreground"
                }`}
              >
                {v.name[0]}
              </div>
              <div>
                <p className="text-xs font-semibold">{v.name}</p>
                <p className="text-[11px] text-muted-foreground">{v.lang}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center gap-2.5 rounded-lg bg-muted/30 px-3 py-2">
          <Play className="h-3.5 w-3.5 text-primary" />
          <div className="h-1.5 flex-1 rounded-full bg-border/50">
            <div className="h-full w-2/3 rounded-full bg-primary/60" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">0:04</span>
        </div>
      </div>
    </div>
  );
}

function StepIllustrationEditor() {
  return (
    <div className="step-mockup w-full p-4 sm:p-5">
      <div className="flex flex-col overflow-hidden rounded-lg border border-border/30">
        <div className="flex h-8 items-center gap-2 border-b border-border/30 bg-surface/50 px-3">
          <div className="flex gap-1.5">
            <div className="h-2 w-2 rounded-full bg-[#FF5F57]" />
            <div className="h-2 w-2 rounded-full bg-[#FEBC2E]" />
            <div className="h-2 w-2 rounded-full bg-[#28C840]" />
          </div>
          <span className="font-mono text-xs text-muted-foreground">
            ClipDub Editor
          </span>
        </div>
        <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-card to-muted/50">
          <div className="h-16 w-24 rounded-md border border-border/30 bg-muted/50" />
        </div>
        <div className="space-y-1.5 border-t border-border/30 bg-surface/30 p-2.5">
          <div className="mb-1 flex items-center gap-1.5">
            <div className="h-1.5 w-3 rounded-full bg-primary/30" />
            <span className="text-[10px] text-muted-foreground/60">Video</span>
          </div>
          <div className="h-3.5 rounded bg-primary/15" />
          <div className="mb-1 flex items-center gap-1.5">
            <div className="h-1.5 w-3 rounded-full bg-accent/30" />
            <span className="text-[10px] text-muted-foreground/60">Audio</span>
          </div>
          <div className="h-3.5 rounded bg-accent/15" />
          <div className="mb-1 flex items-center gap-1.5">
            <div className="h-1.5 w-3 rounded-full bg-blue-400/30" />
            <span className="text-[10px] text-muted-foreground/60">
              Subtitles
            </span>
          </div>
          <div className="flex gap-1">
            <div className="h-3.5 w-1/3 rounded bg-blue-400/15" />
            <div className="h-3.5 w-1/4 rounded bg-blue-400/15" />
            <div className="h-3.5 w-1/5 rounded bg-blue-400/15" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIllustrationExport() {
  return (
    <div className="step-mockup w-full p-6 sm:p-8">
      <div className="flex flex-col items-center justify-center gap-4 py-6">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10">
          <CheckCircle className="h-8 w-8 text-emerald-500" />
        </div>
        <div className="text-center">
          <p className="font-display text-base font-semibold">
            Export Complete!
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            product-demo-final.mp4
          </p>
        </div>
        <div className="flex gap-2">
          {["1080p", "MP4", "2:34"].map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-muted/50 px-3 py-1 font-mono text-xs text-muted-foreground"
            >
              {tag}
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-4 py-2 text-xs font-medium text-emerald-500">
            <Download className="h-3.5 w-3.5" />
            Download
          </div>
          <div className="flex items-center gap-1.5 rounded-lg bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
            <Share2 className="h-3.5 w-3.5" />
            Share
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Gradient-border card wrapper
   ───────────────────────────────────────────── */
function GradientCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`gradient-border-card group relative ${className}`}>
      <div className="absolute -inset-px rounded-[inherit] bg-gradient-to-br from-primary/20 via-transparent to-accent/15 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="relative h-full rounded-[inherit] border border-border/40 bg-card/40 backdrop-blur-sm transition-colors duration-300 group-hover:bg-card/60">
        {children}
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   Main Landing Page
   ───────────────────────────────────────────── */
export default function LandingPage() {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: "power4.out" } });

      tl.from("[data-hero-tag]", { y: 24, opacity: 0, duration: 0.7 })
        .from(
          "[data-hero-title] .hw",
          { y: 100, opacity: 0, rotateX: 40, duration: 1.3, stagger: 0.07 },
          "-=0.35",
        )
        .from("[data-hero-desc]", { y: 30, opacity: 0, duration: 0.9 }, "-=0.7")
        .from("[data-hero-cta]", { y: 24, opacity: 0, duration: 0.7 }, "-=0.5")
        .from(
          "[data-hero-stats] > div",
          { y: 20, opacity: 0, duration: 0.5, stagger: 0.1 },
          "-=0.3",
        )
        .from(
          "[data-hero-preview]",
          { y: 60, opacity: 0, scale: 0.96, duration: 1.1 },
          "-=0.8",
        )
        .from(
          "[data-hero-float]",
          {
            scale: 0,
            opacity: 0,
            duration: 0.6,
            ease: "back.out(2)",
          },
          "-=0.3",
        );

      // Floating orbs
      gsap.to("[data-orb-1]", {
        x: 50,
        y: -40,
        duration: 7,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to("[data-orb-2]", {
        x: -40,
        y: 30,
        duration: 9,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });
      gsap.to("[data-orb-3]", {
        x: 25,
        y: -20,
        duration: 6,
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
      });

      // Scroll-triggered reveals
      const reveals = gsap.utils.toArray("[data-reveal]") as HTMLElement[];
      reveals.forEach((el) => {
        gsap.from(el, {
          scrollTrigger: el,
          y: 50,
          opacity: 0,
          duration: 0.9,
          ease: "power3.out",
        });
      });

      // Staggered card reveals
      const cardGroups = document.querySelectorAll("[data-stagger-group]");
      cardGroups.forEach((group) => {
        const cards = group.querySelectorAll("[data-stagger-item]");
        gsap.from(cards, {
          scrollTrigger: group as HTMLElement,
          y: 40,
          opacity: 0,
          duration: 0.7,
          stagger: 0.1,
          ease: "power3.out",
        });
      });
    });

    return () => ctx.revert();
  }, []);

  /* ── Workflow steps ── */
  const steps = [
    {
      num: "01",
      title: "Upload Your Screen Recording",
      description:
        "Drag and drop your screen capture. We support all formats — no microphone or audio track needed.",
      icon: Upload,
      illustration: <StepIllustrationUpload />,
      highlights: ["Multi-format", "No audio needed", "Up to 500MB"],
    },
    {
      num: "02",
      title: "AI Writes the Narration",
      description:
        "Our AI analyzes each screen to understand context, then generates a clear, step-by-step narration script.",
      icon: Brain,
      illustration: <StepIllustrationScript />,
      highlights: ["Context-aware", "Editable", "Instant"],
    },
    {
      num: "03",
      title: "Choose a Professional Voice",
      description:
        "Select from 100+ natural-sounding AI voices in dozens of languages — your tutorial sounds native everywhere.",
      icon: Mic2,
      illustration: <StepIllustrationVoice />,
      highlights: ["100+ voices", "Multi-lingual", "Preview instantly"],
    },
    {
      num: "04",
      title: "Auto-Edit & Sync",
      description:
        "Video, voiceover, and subtitles sync automatically. Fine-tune timing or text in the multi-track editor.",
      icon: Layers,
      illustration: <StepIllustrationEditor />,
      highlights: ["Auto-sync", "Multi-track", "Customizable"],
    },
    {
      num: "05",
      title: "Export & Share",
      description:
        "Render your tutorial or demo in HD and download it ready for docs, social media, or onboarding.",
      icon: Download,
      illustration: <StepIllustrationExport />,
      highlights: ["1080p", "Fast render", "Share-ready"],
    },
  ];

  /* ── Features data ── */
  const features = [
    {
      icon: Brain,
      title: "AI Script Control",
      desc: "Full control over the AI-generated narration. Edit, refine, and customize every step of your tutorial.",
      accent: "from-primary/20 to-orange-500/10",
    },
    {
      icon: Film,
      title: "Automatic Rendering",
      desc: "Professional rendering that combines your recording, voiceover, and subtitles seamlessly.",
      accent: "from-accent/15 to-yellow-500/5",
    },
    {
      icon: Mic2,
      title: "100+ Voices",
      desc: "Natural-sounding AI voices so your tutorials sound professional without a mic.",
      accent: "from-blue-500/15 to-cyan-500/5",
    },
    {
      icon: Globe2,
      title: "Multi-Lingual",
      desc: "Create tutorials and demos in any language with native-quality voiceovers.",
      accent: "from-emerald-500/15 to-green-500/5",
    },
    {
      icon: Monitor,
      title: "Device Mockups",
      desc: "Present your app in beautiful device frames — MacBook, iPhone, iPad, and more.",
      accent: "from-violet-500/15 to-purple-500/5",
    },
    {
      icon: Shield,
      title: "Privacy First",
      desc: "Videos processed securely. No data stored after export. Your content stays yours.",
      accent: "from-rose-500/15 to-pink-500/5",
    },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden geo-pattern">
      {/* ── Ambient orbs ── */}
      <div
        data-orb-1
        className="pointer-events-none absolute left-[5%] top-[10%] h-[600px] w-[600px] rounded-full bg-primary/6 blur-[180px]"
      />
      <div
        data-orb-2
        className="pointer-events-none absolute bottom-[20%] right-[5%] h-[500px] w-[500px] rounded-full bg-accent/5 blur-[160px]"
      />
      <div
        data-orb-3
        className="pointer-events-none absolute left-[40%] top-[50%] h-[350px] w-[350px] rounded-full bg-blue-500/4 blur-[140px]"
      />

      {/* ─── Nav ─── */}
      <nav className="sticky top-0 z-50 border-b border-border/30 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3.5">
          <ClipDubLogo variant="full" size={32} />

          <div className="hidden items-center gap-8 text-sm text-muted-foreground md:flex">
            <a
              href="#how-it-works"
              className="transition-colors hover:text-foreground"
            >
              Process
            </a>
            <a
              href="#features"
              className="transition-colors hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#use-cases"
              className="transition-colors hover:text-foreground"
            >
              Use Cases
            </a>
            <a
              href="#pricing"
              className="transition-colors hover:text-foreground"
            >
              Pricing
            </a>
          </div>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link
              href="/dashboard"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(255,94,58,0.3)] glow-primary"
            >
              Open Editor
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════
          HERO — asymmetric split with floating elements
          ═══════════════════════════════════════ */}
      <section
        ref={heroRef}
        className="relative z-10 mx-auto max-w-7xl px-6 pb-24 pt-20 md:pt-32"
      >
        <div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
          {/* Left — copy */}
          <div>
            <div
              data-hero-tag
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary"
            >
              <Sparkles className="h-3 w-3" />
              Powered by Claude Vision AI
            </div>

            <h1
              data-hero-title
              className="font-display text-4xl font-bold leading-[1.06] tracking-tight sm:text-5xl lg:text-6xl xl:text-[4.25rem]"
              style={{ perspective: "800px" }}
            >
              <span className="hw inline-block">Tutorials&nbsp;</span>
              <span className="hw inline-block">&amp;&nbsp;</span>
              <span className="hw inline-block">Products Demos&nbsp;</span>
              <br className="hidden sm:block" />
              <span className="hw inline-block bg-gradient-to-r from-primary via-orange-400 to-accent bg-clip-text text-transparent">
                in Minutes.
              </span>
            </h1>

            <p
              data-hero-desc
              className="mt-7 max-w-lg text-base leading-relaxed text-muted-foreground sm:text-lg"
            >
              Record your screen, and we handle the rest: AI writes the
              narration, picks a professional voice, and syncs everything into a
              polished tutorial or product demo &mdash;{" "}
              <span className="font-medium text-foreground/80">
                no microphone required.
              </span>
            </p>

            <div
              data-hero-cta
              className="mt-9 flex flex-wrap items-center gap-4"
            >
              <Link
                href="/dashboard"
                className="group relative flex items-center gap-2.5 overflow-hidden rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-white transition-all hover:shadow-[0_0_32px_rgba(255,94,58,0.35)]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%]" />
                <Play className="relative h-4 w-4" />
                <span className="relative">Start Creating Free</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <span className="text-xs text-muted-foreground">
                No account required
              </span>
            </div>

            {/* Stats */}
            <div
              data-hero-stats
              className="mt-12 flex flex-wrap gap-8 border-t border-border/30 pt-7"
            >
              {[
                { value: "100+", label: "AI Voices" },
                { value: "30+", label: "Languages" },
                { value: "< 3 min", label: "Avg. Export" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="font-display text-2xl font-bold text-primary">
                    {s.value}
                  </p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {s.label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Right — editor preview with floating elements */}
          <div data-hero-preview className="relative">
            {/* Main editor card */}
            <div className="overflow-hidden rounded-2xl border border-border/50 bg-card/60 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)] backdrop-blur-md">
              <div className="flex items-center gap-2 border-b border-border/40 px-4 py-3">
                <div className="flex gap-1.5">
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
                  <div className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="ml-2 flex items-center gap-1.5">
                  <Clapperboard className="h-3 w-3 text-muted-foreground/50" />
                  <span className="text-xs font-medium text-muted-foreground/70">
                    ClipDub Editor
                  </span>
                </div>
              </div>
              <div className="flex aspect-[16/10] items-center justify-center bg-gradient-to-br from-surface via-card to-surface">
                <div className="text-center">
                  <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary/40">
                    <Monitor className="h-7 w-7" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground/40">
                    Your video preview
                  </p>
                </div>
              </div>
              {/* Faux timeline */}
              <div className="space-y-1.5 border-t border-border/40 bg-surface/40 px-4 py-3">
                <div className="h-2 w-full rounded-full bg-primary/12" />
                <div className="h-2 w-3/4 rounded-full bg-accent/10" />
                <div className="flex gap-1">
                  <div className="h-2 w-1/4 rounded-full bg-blue-400/10" />
                  <div className="h-2 w-1/5 rounded-full bg-blue-400/10" />
                  <div className="h-2 w-1/6 rounded-full bg-blue-400/10" />
                </div>
              </div>
            </div>

            {/* Floating badge — bottom left */}
            <div
              data-hero-float
              className="absolute -bottom-5 -left-5 rounded-xl border border-border/40 bg-card/90 px-4 py-2.5 shadow-lg backdrop-blur-md"
            >
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10">
                  <Zap className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold">Render Complete</p>
                  <p className="text-[11px] text-muted-foreground">
                    1080p &middot; 2:34
                  </p>
                </div>
              </div>
            </div>

            {/* Floating badge — top right */}
            <div
              data-hero-float
              className="absolute -right-3 -top-3 rounded-xl border border-border/40 bg-card/90 px-3.5 py-2 shadow-lg backdrop-blur-md"
            >
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10">
                  <Sparkles className="h-3.5 w-3.5 text-accent" />
                </div>
                <div>
                  <p className="text-xs font-semibold">AI Script Ready</p>
                  <p className="text-[11px] text-muted-foreground">
                    14 sentences
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          HOW IT WORKS — interactive step selector + illustration
          ═══════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="relative z-10 border-t border-border/30 py-28"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Process
            </span>
          </div>
          <h2
            data-reveal
            className="mx-auto mb-5 max-w-2xl text-center font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            From screen recording to narrated video
          </h2>
          <p
            data-reveal
            className="mx-auto mb-20 max-w-xl text-center text-muted-foreground"
          >
            Five steps. All AI-powered. Just record your screen and export a
            professional tutorial or demo.
          </p>

          {/* All steps visible */}
          <div className="flex flex-col gap-20">
            {steps.map((step, i) => {
              const isReversed = i % 2 === 1;
              return (
                <div
                  key={step.num}
                  data-reveal
                  className={`flex flex-col items-center gap-10 lg:flex-row lg:gap-16 ${
                    isReversed ? "lg:flex-row-reverse" : ""
                  }`}
                >
                  {/* Text side */}
                  <div className="flex-1">
                    <div className="mb-4 flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary text-white font-display text-sm font-bold shadow-[0_0_16px_rgba(255,94,58,0.25)]">
                        {step.num}
                      </div>
                      <step.icon className="h-5 w-5 text-primary/60" />
                    </div>

                    <h3 className="font-display text-2xl font-bold sm:text-3xl">
                      {step.title}
                    </h3>
                    <p className="mt-3 max-w-md text-base leading-relaxed text-muted-foreground">
                      {step.description}
                    </p>

                    <div className="mt-5 flex flex-wrap gap-2">
                      {step.highlights.map((h) => (
                        <span
                          key={h}
                          className="rounded-full bg-primary/8 px-3 py-1 text-sm font-medium text-primary"
                        >
                          {h}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Illustration side */}
                  <div className="w-full max-w-md flex-1 lg:max-w-none">
                    {step.illustration}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FEATURES — bento grid with accent gradients
          ═══════════════════════════════════════ */}
      <section
        id="features"
        className="relative z-10 border-t border-border/30 py-28"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Capabilities
            </span>
          </div>
          <h2
            data-reveal
            className="mb-4 text-center font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Everything you need, built in
          </h2>
          <p
            data-reveal
            className="mx-auto mb-16 max-w-xl text-center text-muted-foreground"
          >
            Everything to turn a silent screen recording into a narrated
            tutorial or product demo.
          </p>

          {/* Bento: row 1 = 1 wide + 2 small, row 2 = 2 small + 1 wide */}
          <div
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-6"
            data-stagger-group
          >
            {features.map((feat, i) => {
              const isWide = i === 0 || i === 5;
              return (
                <div
                  key={feat.title}
                  data-stagger-item
                  className={`group relative overflow-hidden rounded-2xl ${
                    isWide ? "sm:col-span-2 lg:col-span-3" : "lg:col-span-2"
                  }`}
                >
                  {/* Hover gradient backdrop */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feat.accent} opacity-0 transition-opacity duration-500 group-hover:opacity-100`}
                  />
                  <div className="relative h-full rounded-2xl border border-border/40 bg-card/40 p-7 backdrop-blur-sm transition-all duration-300 group-hover:border-primary/15 group-hover:bg-card/60">
                    <div
                      className={`mb-4 flex items-center justify-center rounded-xl bg-primary/10 text-primary transition-all duration-300 group-hover:bg-primary/15 group-hover:shadow-[0_0_20px_rgba(255,94,58,0.1)] ${
                        isWide ? "h-13 w-13" : "h-11 w-11"
                      }`}
                    >
                      <feat.icon className={isWide ? "h-6 w-6" : "h-5 w-5"} />
                    </div>
                    <h3
                      className={`mb-2 font-display font-semibold ${
                        isWide ? "text-lg" : "text-base"
                      }`}
                    >
                      {feat.title}
                    </h3>
                    <p
                      className={`leading-relaxed text-muted-foreground ${
                        isWide ? "max-w-sm text-sm" : "text-sm"
                      }`}
                    >
                      {feat.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          USE CASES — staggered cards with icon accents
          ═══════════════════════════════════════ */}
      <section
        id="use-cases"
        className="relative z-10 border-t border-border/30 py-28"
      >
        <div className="mx-auto max-w-6xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Use Cases
            </span>
          </div>
          <h2
            data-reveal
            className="mb-16 text-center font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Built for teams that ship
          </h2>

          <div className="grid gap-4 sm:grid-cols-2" data-stagger-group>
            {[
              {
                icon: Users,
                title: "Product Managers",
                desc: "Create feature demos and walkthroughs for stakeholders without recording your voice.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
              },
              {
                icon: Brain,
                title: "Learning & Development",
                desc: "Build step-by-step tutorials and onboarding videos at scale — no mic, no editing skills.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
              },
              {
                icon: Clapperboard,
                title: "Founders & Startups",
                desc: "Record a quick demo of your app and get a polished video to show investors, users, and press.",
                color: "text-accent",
                bg: "bg-accent/10",
              },
              {
                icon: Globe2,
                title: "Marketing Teams",
                desc: "Turn any screen recording into social-ready product videos in multiple languages.",
                color: "text-violet-400",
                bg: "bg-violet-500/10",
              },
            ].map((item) => (
              <GradientCard key={item.title}>
                <div data-stagger-item className="flex items-start gap-5 p-6">
                  <div
                    className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.bg} ${item.color} transition-transform duration-300 group-hover:scale-110`}
                  >
                    <item.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="mb-1.5 font-display text-base font-semibold">
                      {item.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {item.desc}
                    </p>
                  </div>
                </div>
              </GradientCard>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          WHY CLIPDUB — segmented strip
          ═══════════════════════════════════════ */}
      <section className="relative z-10 border-t border-border/30 py-28">
        <div className="mx-auto max-w-6xl px-6">
          <h2
            data-reveal
            className="mb-16 text-center font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Why ClipDub?
          </h2>

          <div
            className="grid overflow-hidden rounded-2xl border border-border/40 sm:grid-cols-3"
            data-stagger-group
          >
            {[
              {
                icon: Clock,
                title: "10x Faster",
                desc: "Skip voice recording and manual editing. Get a narrated tutorial in minutes, not hours.",
                accent: "primary",
              },
              {
                icon: SlidersHorizontal,
                title: "Full Creative Control",
                desc: "Edit scripts, swap voices, adjust timing — always in the driver's seat.",
                accent: "accent",
              },
              {
                icon: Shield,
                title: "Your Content, Yours",
                desc: "No data stored. No watermarks. Privacy by design.",
                accent: "emerald-500",
              },
            ].map((item, i) => (
              <div
                key={item.title}
                data-stagger-item
                className={`group relative flex flex-col items-center bg-card/30 p-10 text-center backdrop-blur-sm transition-colors duration-300 hover:bg-card/50 ${
                  i < 2
                    ? "border-b border-border/30 sm:border-b-0 sm:border-r"
                    : ""
                }`}
              >
                <div
                  className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-${item.accent}/10 text-${item.accent} transition-transform duration-300 group-hover:scale-110`}
                >
                  <item.icon className="h-7 w-7" />
                </div>
                <h3 className="mb-2.5 font-display text-base font-semibold">
                  {item.title}
                </h3>
                <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          PRICING
          ═══════════════════════════════════════ */}
      <section
        id="pricing"
        className="relative z-10 border-t border-border/30 py-28"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Pricing
            </span>
          </div>
          <h2
            data-reveal
            className="mb-4 text-center font-display text-3xl font-bold sm:text-4xl lg:text-5xl"
          >
            Simple, transparent pricing
          </h2>
          <p
            data-reveal
            className="mx-auto mb-16 max-w-xl text-center text-muted-foreground"
          >
            Start free and scale as you grow. No hidden fees.
          </p>

          <div
            className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-4"
            data-stagger-group
          >
            {/* ── Trial ── */}
            <div
              data-stagger-item
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-card/60"
            >
              <div className="mb-6 text-center">
                <h3 className="font-display text-lg font-bold">Trial</h3>
                <p className="mt-1 text-xs text-muted-foreground">Try it out</p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Perfect for trying out ClipDub with basic features and
                  limited usage.
                </p>
              </div>
              <div className="mb-6 text-center">
                <span className="font-display text-4xl font-bold">$0.99</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <a
                href="#"
                className="mb-8 block w-full rounded-full border border-primary/30 bg-primary/5 py-2.5 text-center text-sm font-semibold text-primary transition-all hover:bg-primary/10"
              >
                Start Trial
              </a>
              <ul className="mt-auto space-y-2.5">
                {[
                  "3 mins of video upload / month",
                  "5 mins of AI voice included",
                  "2 renders / month",
                  "1 translation / month",
                  "600 MB storage",
                  "1 user",
                  "3 mins max / video",
                  "Watermark enabled",
                  "Standard AI voice quality",
                  "Documents (coming soon)",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Plus (Most Popular) ── */}
            <div
              data-stagger-item
              className="group relative flex flex-col overflow-hidden rounded-2xl border-2 border-primary/40 bg-card/50 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/60 hover:bg-card/70"
            >
              <div className="absolute -right-8 top-5 rotate-45 bg-primary px-10 py-1 text-xs font-bold text-white shadow-lg">
                Most Popular
              </div>
              <div className="mb-6 text-center">
                <h3 className="font-display text-lg font-bold">Plus</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Solo Creators
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Perfect for solo creators who want high-quality voices, more
                  uploads, and watermark-free videos.
                </p>
              </div>
              <div className="mb-6 text-center">
                <span className="font-display text-4xl font-bold">$19</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <a
                href="#"
                className="mb-8 block w-full rounded-full bg-primary py-2.5 text-center text-sm font-semibold text-white transition-all hover:bg-primary/90 hover:shadow-[0_0_24px_rgba(255,94,58,0.3)]"
              >
                Get Plus Plan
              </a>
              <ul className="mt-auto space-y-2.5">
                {[
                  "30 mins of video upload / month",
                  "40 mins of AI voice included",
                  "20 renders / month",
                  "15 translations / month",
                  "10 GB storage",
                  "1 user",
                  "10 mins max / video",
                  "No watermark",
                  "High-quality AI voices",
                  "10 documents/mo (coming soon)",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Teams ── */}
            <div
              data-stagger-item
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-card/60"
            >
              <div className="mb-6 text-center">
                <h3 className="font-display text-lg font-bold">Teams</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Best for teams
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Ideal for small teams collaborating on video content with
                  shared storage and up to 5 users.
                </p>
              </div>
              <div className="mb-6 text-center">
                <span className="font-display text-4xl font-bold">$49</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <a
                href="#"
                className="mb-8 block w-full rounded-full border border-primary/30 bg-primary/5 py-2.5 text-center text-sm font-semibold text-primary transition-all hover:bg-primary/10"
              >
                Get Team Plan
              </a>
              <ul className="mt-auto space-y-2.5">
                {[
                  "60 mins of video upload / month",
                  "80 mins of AI voice included",
                  "40 renders / month",
                  "30 translations / month",
                  "20 GB storage",
                  "Up to 5 team members",
                  "10 mins max / video",
                  "No watermark",
                  "High-quality AI voices",
                  "20 documents/mo (coming soon)",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Pro ── */}
            <div
              data-stagger-item
              className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/40 bg-card/40 p-6 backdrop-blur-sm transition-all duration-300 hover:border-primary/20 hover:bg-card/60"
            >
              <div className="mb-6 text-center">
                <h3 className="font-display text-lg font-bold">Pro</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Agencies & Enterprises
                </p>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Built for agencies and enterprises with high-volume needs,
                  longer videos, and up to 15 team members.
                </p>
              </div>
              <div className="mb-6 text-center">
                <span className="font-display text-4xl font-bold">$199</span>
                <span className="text-sm text-muted-foreground">/month</span>
              </div>
              <a
                href="#"
                className="mb-8 block w-full rounded-full border border-primary/30 bg-primary/5 py-2.5 text-center text-sm font-semibold text-primary transition-all hover:bg-primary/10"
              >
                Get Pro Plan
              </a>
              <ul className="mt-auto space-y-2.5">
                {[
                  "120 mins of video upload / month",
                  "200 mins of AI voice included",
                  "100 renders / month",
                  "60 translations / month",
                  "50 GB storage",
                  "Up to 15 team members",
                  "20 mins max / video",
                  "No watermark",
                  "High-quality AI voices",
                  "50 documents/mo (coming soon)",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
          FINAL CTA
          ═══════════════════════════════════════ */}
      <section className="relative z-10 border-t border-border/30">
        <div className="mx-auto max-w-3xl px-6 py-32 text-center">
          <div data-reveal className="relative">
            {/* Outer glow */}
            <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-primary/10 via-transparent to-accent/8 blur-xl" />

            <div className="relative rounded-3xl border border-border/40 bg-card/30 px-8 py-20 backdrop-blur-sm sm:px-16">
              <h2 className="font-display text-3xl font-bold sm:text-4xl lg:text-5xl">
                Ready to create your
                <br />
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  next tutorial?
                </span>
              </h2>
              <p className="mx-auto mt-6 max-w-md text-muted-foreground">
                No watermarks. No complex setup. Professional tutorials and
                demos right in your browser.
              </p>
              <Link
                href="/dashboard"
                className="group relative mt-9 inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-primary px-10 py-4 text-sm font-semibold text-white transition-all hover:shadow-[0_0_40px_rgba(255,94,58,0.35)]"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-100%] transition-transform duration-700 group-hover:translate-x-[100%]" />
                <span className="relative">Start Creating Free</span>
                <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-border/30 py-8">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6">
            <ClipDubLogo variant="full" size={20} className="text-muted-foreground/50" />
            <div className="flex items-center gap-4 text-xs text-muted-foreground/40">
              <span>Privacy</span>
              <span>Terms</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
