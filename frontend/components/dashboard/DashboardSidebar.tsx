"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Download, BarChart3, Settings, User, LogOut, Shield, Globe } from "lucide-react";
import { ClipDubLogo } from "@/components/brand/ClipDubLogo";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Projects", icon: FolderOpen },
  { href: "/dashboard/website-showcase", label: "Website Video", icon: Globe, premium: true },
  { href: "/dashboard/exports", label: "Exports", icon: Download },
  { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin } = useAuthStore();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  return (
    <aside className="hidden lg:flex w-60 flex-col border-r border-border/40 bg-surface">
      {/* Logo */}
      <div className="flex h-14 items-center px-5 border-b border-border/40">
        <Link href="/dashboard">
          <ClipDubLogo variant="full" size={28} />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <item.icon className="h-4 w-4 shrink-0" />
            {item.label}
            {"premium" in item && item.premium && !user?.subscription?.plan && (
              <span className="ml-auto rounded bg-primary/15 px-1.5 py-0.5 text-[10px] font-bold uppercase leading-none text-primary">
                PRO
              </span>
            )}
          </Link>
        ))}
        {isAdmin && (
          <>
            <div className="my-2 border-t border-border/40" />
            <Link
              href="/dashboard/admin"
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all",
                pathname.startsWith("/dashboard/admin")
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
            >
              <Shield className="h-4 w-4 shrink-0" />
              Admin
            </Link>
          </>
        )}
      </nav>

      {/* User */}
      {user && (
        <div className="border-t border-border/40 px-4 py-3">
          <div className="flex items-center gap-2.5">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt=""
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="h-4 w-4" />
              </div>
            )}
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="text-sm font-medium text-foreground truncate">{user.name}</span>
              <span className="text-xs text-muted-foreground truncate">{user.email}</span>
            </div>
            <button
              onClick={logout}
              className="shrink-0 rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              title="Sign out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
