"use client";

import { usePathname } from "next/navigation";
import { Home, User, Wind, BookOpen, Sparkles } from "lucide-react";

const NAV_ITEMS = [
  { href: "/", label: "Home", icon: Home },
  { href: "/yoga", label: "Yoga", icon: User },
  { href: "/breathing", label: "Breathe", icon: Wind },
  { href: "/calm-music", label: "Music", icon: BookOpen },
  { href: "/ai", label: "AI", icon: Sparkles },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Bottom navigation"
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-1 sm:hidden rounded-t-xl bg-surface/95 backdrop-blur-md"
    >
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || (item.href === "/" && pathname === "/");
        return (
          <a
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center gap-0.5 flex-1 px-1 py-0.5 text-[10px] font-medium transition-colors duration-200 ${
              isActive ? "text-primary-600" : "text-muted"
            }`}
            aria-current={isActive ? "page" : undefined}
          >
            <item.icon className={`size-5 bg-black ${isActive ? "text-primary-600" : "text-muted"}`} />
            <span className="whitespace-nowrap bg-slate-700">{item.label}</span>
          </a>
        );
      })
    }
    </nav>
  );
}