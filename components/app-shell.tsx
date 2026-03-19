"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, FolderKanban, ListTodo, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.16),_transparent_45%),radial-gradient(circle_at_85%_20%,_rgba(168,85,247,0.13),_transparent_42%),linear-gradient(135deg,#09090f_0%,#0f1020_45%,#15142b_100%)] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 rounded-2xl border border-white/10 bg-white/[0.06] p-4 shadow-[0_20px_50px_-35px_rgba(99,102,241,0.7)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-indigo-400/30 to-violet-400/20 p-2">
                <Sparkles className="size-5 text-indigo-200" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">ClearCart AI</h1>
                <p className="text-xs text-slate-400">Open Project & Task Platform</p>
              </div>
            </div>
            <nav className="flex flex-wrap gap-2">
              {nav.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition-all duration-200",
                      active
                        ? "border-indigo-300/60 bg-gradient-to-r from-indigo-500/30 to-violet-500/20 text-indigo-100 shadow-[0_12px_30px_-22px_rgba(129,140,248,0.95)]"
                        : "border-white/10 bg-white/[0.04] text-slate-300 hover:-translate-y-0.5 hover:bg-white/[0.09]",
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </header>
        {children}
      </div>
    </div>
  );
}
