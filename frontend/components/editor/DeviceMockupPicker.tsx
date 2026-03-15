"use client";

import { useRef, useEffect } from "react";
import gsap from "gsap";
import { useProjectStore } from "@/lib/store/project-store";
import { Monitor, Smartphone, Tablet, Globe, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import type { DeviceMockupConfig } from "@/lib/types/project";
import { cn } from "@/lib/utils";

const DEVICES: {
  type: DeviceMockupConfig["type"];
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: "macbook-pro", label: "MacBook Pro", icon: Monitor },
  { type: "iphone-15", label: "iPhone 15", icon: Smartphone },
  { type: "ipad", label: "iPad", icon: Tablet },
  { type: "browser", label: "Browser", icon: Globe },
];

const GRADIENT_PRESETS = [
  { label: "Obsidian", colors: ["#0B0F19", "#151C2C", "#0B0F19"] },
  { label: "Deep Sea", colors: ["#0a192f", "#112240", "#0a192f"] },
  { label: "Nightfall", colors: ["#1a0a2e", "#2d1b4e", "#1a0a2e"] },
  { label: "Pine", colors: ["#0a1f0a", "#1a3a1a", "#0a1f0a"] },
  { label: "Ember", colors: ["#2d1b0e", "#4a2c17", "#2d1b0e"] },
  { label: "Frost", colors: ["#f5f5f7", "#e8e8ed", "#f5f5f7"] },
];

export function DeviceMockupPicker() {
  const { project, updateComposition, pushHistory } = useProjectStore();
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll("[data-device-card]");
    gsap.fromTo(
      cards,
      { y: 10, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.3, stagger: 0.05, ease: "power2.out" }
    );
  }, []);

  const currentDevice = project.composition.deviceMockup;

  const selectDevice = (type: DeviceMockupConfig["type"]) => {
    pushHistory();
    if (currentDevice?.type === type) {
      updateComposition({ deviceMockup: null });
    } else {
      updateComposition({
        deviceMockup: { type, scale: 0.8, position: { x: 0.5, y: 0.5 } },
      });
    }
  };

  return (
    <div className="flex h-full flex-col gap-4 overflow-y-auto p-4">
      {/* Device selection */}
      <div>
        <h3 className="mb-3 font-display text-sm font-semibold">Device Mockup</h3>
        <div ref={cardsRef} className="grid grid-cols-2 gap-2">
          {DEVICES.map((device) => (
            <button
              key={device.type}
              data-device-card
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border p-3.5 transition-all duration-200",
                currentDevice?.type === device.type
                  ? "border-primary/40 bg-primary/10 text-primary ring-1 ring-primary/10"
                  : "border-border/30 text-muted-foreground hover:border-border/60 hover:bg-muted/30 hover:text-foreground/80"
              )}
              onClick={() => selectDevice(device.type)}
            >
              <device.icon className="h-5 w-5" />
              <span className="text-[11px] font-medium">{device.label}</span>
            </button>
          ))}
        </div>
        {currentDevice && (
          <Button
            variant="ghost"
            size="sm"
            className="mt-2 h-7 w-full text-[11px] text-muted-foreground"
            onClick={() => {
              pushHistory();
              updateComposition({ deviceMockup: null });
            }}
          >
            <X className="h-3 w-3" />
            Remove Mockup
          </Button>
        )}
      </div>

      {/* Scale */}
      {currentDevice && (
        <div>
          <label className="mb-2 flex items-center justify-between font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
            Scale
            <span className="normal-case tracking-normal text-foreground/60">
              {Math.round((currentDevice.scale || 0.8) * 100)}%
            </span>
          </label>
          <Slider
            value={[(currentDevice.scale || 0.8) * 100]}
            onValueChange={([v]) =>
              updateComposition({
                deviceMockup: { ...currentDevice, scale: v / 100 },
              })
            }
            min={30}
            max={120}
            step={1}
          />
        </div>
      )}

      {/* Background */}
      <div className="border-t border-border/30 pt-4">
        <h3 className="mb-3 font-display text-sm font-semibold">Background</h3>
        <div className="grid grid-cols-3 gap-2">
          {GRADIENT_PRESETS.map((preset) => (
            <button
              key={preset.label}
              className={cn(
                "group flex h-14 items-end overflow-hidden rounded-xl border p-2 transition-all duration-200",
                JSON.stringify(project.composition.gradientColors) ===
                  JSON.stringify(preset.colors)
                  ? "border-primary/40 ring-1 ring-primary/20"
                  : "border-border/30 hover:border-border/60"
              )}
              style={{
                background: `linear-gradient(135deg, ${preset.colors.join(", ")})`,
              }}
              onClick={() => {
                pushHistory();
                updateComposition({
                  backgroundType: "gradient",
                  gradientColors: preset.colors,
                });
              }}
            >
              <span className="text-[9px] font-medium text-white/40 transition-colors group-hover:text-white/60">
                {preset.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
