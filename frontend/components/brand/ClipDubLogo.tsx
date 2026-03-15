interface LogoProps {
  /** "icon" = mark only, "full" = mark + wordmark */
  variant?: "icon" | "full";
  /** Height in pixels — width scales proportionally */
  size?: number;
  className?: string;
}

/**
 * ClipDub logomark — a screen shape transforming into a play button,
 * with a dynamic spark at the tip representing AI transformation.
 */
export function ClipDubLogo({
  variant = "full",
  size = 32,
  className,
}: LogoProps) {
  const iconSize = size;
  // For the full variant, wordmark sits beside the icon
  const wordmarkHeight = size * 0.55;

  return (
    <span
      className={`inline-flex items-center gap-2 ${className ?? ""}`}
      style={{ height: iconSize }}
    >
      {/* ── Logomark ── */}
      <svg
        width={iconSize}
        height={iconSize}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="ClipDub logo"
      >
        <defs>
          {/* Primary gradient: orange → yellow */}
          <linearGradient
            id="sm-grad-primary"
            x1="0"
            y1="0"
            x2="64"
            y2="64"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FF5E3A" />
            <stop offset="100%" stopColor="#F5C542" />
          </linearGradient>

          {/* Subtle inner glow */}
          <radialGradient id="sm-grad-glow" cx="0.35" cy="0.35" r="0.65">
            <stop offset="0%" stopColor="#FF5E3A" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FF5E3A" stopOpacity="0" />
          </radialGradient>

          {/* Spark gradient */}
          <linearGradient id="sm-grad-spark" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#F5C542" />
            <stop offset="100%" stopColor="#FFFBE6" />
          </linearGradient>
        </defs>

        {/* Background: rounded screen shape */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="16"
          fill="url(#sm-grad-primary)"
        />

        {/* Inner glow overlay */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="16"
          fill="url(#sm-grad-glow)"
        />

        {/* Subtle top-left highlight for depth */}
        <rect
          x="2"
          y="2"
          width="60"
          height="60"
          rx="16"
          fill="white"
          opacity="0.08"
          mask="url(#sm-highlight-mask)"
        />

        {/* Screen bezel inset — darker inner rectangle suggesting a display */}
        <rect
          x="8"
          y="8"
          width="48"
          height="48"
          rx="11"
          fill="rgba(0,0,0,0.25)"
        />

        {/* Play triangle — slightly off-center left for visual balance */}
        <path d="M26 20 L46 32 L26 44Z" fill="white" opacity="0.95" />

        {/* AI spark: 3 small radiating lines at the play button tip */}
        <g
          stroke="#FFFBE6"
          strokeWidth="1.8"
          strokeLinecap="round"
          opacity="0.9"
        >
          {/* Main spark ray — horizontal */}
          <line x1="47" y1="32" x2="53" y2="32" />
          {/* Upper ray */}
          <line x1="46.5" y1="28" x2="51" y2="25" />
          {/* Lower ray */}
          <line x1="46.5" y1="36" x2="51" y2="39" />
        </g>

        {/* Small sparkle dot */}
        <circle cx="53.5" cy="32" r="1.5" fill="url(#sm-grad-spark)" />
      </svg>

      {/* ── Wordmark ── */}
      {variant === "full" && (
        <svg
          height={wordmarkHeight}
          viewBox="0 0 220 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="ClipDub"
        >
          <defs>
            <linearGradient
              id="sm-text-grad"
              x1="0"
              y1="0"
              x2="220"
              y2="0"
              gradientUnits="userSpaceOnUse"
            >
              <stop offset="0%" stopColor="#FF5E3A" />
              <stop offset="60%" stopColor="#F5C542" />
            </linearGradient>
          </defs>
          {/* "Clip" in current foreground color, "Dub" in gradient */}
          <text
            x="0"
            y="31"
            fontFamily="'Space Grotesk', sans-serif"
            fontWeight="700"
            fontSize="32"
            letterSpacing="-0.02em"
            fill="currentColor"
          >
            Clip
          </text>
          <text
            x="82"
            y="31"
            fontFamily="'Space Grotesk', sans-serif"
            fontWeight="700"
            fontSize="32"
            letterSpacing="-0.02em"
            fill="url(#sm-text-grad)"
          >
            Dub
          </text>
        </svg>
      )}
    </span>
  );
}
