"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderOpen, Download, BarChart3, Settings, User } from "lucide-react";
import { ClipDubLogo } from "@/components/brand/ClipDubLogo";
import { useAuthStore } from "@/lib/store/auth-store";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Projects", icon: FolderOpen },
  { href: "/dashboard/exports", label: "Exports", icon: Download },
  { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuthStore();

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
          </Link>
        ))}
      </nav>

      {/* User */}
      {user && (
        <div className="border-t border-border/40 px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
              <User className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-foreground">{user.name}</span>
              <span className="text-[11px] text-muted-foreground">Free Plan</span>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
