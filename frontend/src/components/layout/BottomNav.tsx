"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Flower2, Home, Music2, Sparkles, Wind } from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/yoga", label: "Yoga", icon: Flower2 },
  { href: "/breathing", label: "Breathe", icon: Wind },
  { href: "/calm-music", label: "Music", icon: Music2 },
  { href: "/ai", label: "AI Guide", icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();

  if (pathname !== "/dashboard" && !pathname.startsWith("/admin")) return null;

  return (
    <nav aria-label="Mobile navigation" className="fixed inset-x-0 bottom-0 z-50 px-3 pt-1 pb-[max(0.35rem,env(safe-area-inset-bottom))] sm:hidden">
      <div className="mx-auto flex max-w-md items-center rounded-[19px] border border-[#e7ebe5]/90 bg-white/90 px-1 py-1 shadow-[0_4px_20px_rgba(30,55,41,0.11)] backdrop-blur-2xl">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? "page" : undefined}
              className={`group flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-0 rounded-[14px] px-1 py-0.5 text-center transition-all duration-200 ease-out focus-visible:z-10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:scale-[0.97] motion-reduce:transition-none ${isActive ? "text-primary-800" : "text-[#737e76] hover:bg-[#f4f7f3] hover:text-primary-800"}`}
            >
              <span className={`flex size-7 items-center justify-center rounded-full transition-all duration-200 motion-reduce:transition-none ${isActive ? "scale-105 bg-[#e5f1e8] text-primary-800" : "bg-transparent group-hover:bg-[#edf4ef]"}`}>
                <Icon className="size-[18px]" strokeWidth={isActive ? 2.2 : 1.8} aria-hidden="true" />
              </span>
              <span className={`max-w-full truncate text-[9px] leading-[11px] tracking-[0.01em] ${isActive ? "font-semibold" : "font-medium"}`}>{item.label === "AI Guide" ? "AI" : item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
