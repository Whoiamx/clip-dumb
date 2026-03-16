"use client";

import { User, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ClipDubLogo } from "@/components/brand/ClipDubLogo";
import { useAuthStore } from "@/lib/store/auth-store";
import Link from "next/link";

export function DashboardHeader() {
  const { user, logout } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 flex h-14 items-center justify-between border-b border-border/40 bg-background/80 px-6 backdrop-blur-xl">
      {/* Logo visible only on mobile (sidebar hidden) */}
      <div className="lg:hidden">
        <Link href="/dashboard" className="flex items-center">
          <ClipDubLogo variant="full" size={28} />
        </Link>
      </div>
      <div className="hidden lg:block" />

      <div className="flex items-center gap-3">
        <ThemeToggle />
        {/* User + logout visible only on mobile (sidebar shows it on desktop) */}
        <div className="lg:hidden flex items-center gap-2">
          {user && (
            <>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" referrerPolicy="no-referrer" crossOrigin="anonymous" className="h-8 w-8 rounded-full object-cover" />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <User className="h-4 w-4" />
                </div>
              )}
              <span className="text-sm text-muted-foreground">{user.name}</span>
              <button
                onClick={logout}
                className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
