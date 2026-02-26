"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  History,
  Bookmark,
  Archive,
  Sparkles,
  Settings,
} from "lucide-react";

const navItems = [
  { icon: History, href: "/", label: "History" },
  { icon: Bookmark, href: "/favorites", label: "Favorites" },
  { icon: Archive, href: "/vault", label: "Vault" },
  { icon: Sparkles, href: "/chat", label: "AI Chat" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-[60px] flex-col items-center gap-2 border-r border-border-subtle bg-sidebar-bg py-5 shadow-[1px_0_20px_0_#FF6EC715]">
      {/* Logo */}
      <Link
        href="/"
        className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-b from-accent-pink to-[#7B68EE]"
      >
        <span className="font-heading text-xl font-extrabold text-white">
          Z
        </span>
      </Link>

      <div className="h-4" />

      {/* Nav Icons */}
      {navItems.map(({ icon: Icon, href, label }) => {
        const isActive =
          href === "/chat"
            ? pathname === "/chat"
            : href === "/"
              ? pathname === "/"
              : pathname.startsWith(href);

        return (
          <Link
            key={href}
            href={href}
            title={label}
            className="flex h-10 w-10 items-center justify-center transition-colors"
          >
            <Icon
              size={22}
              className={
                isActive
                  ? href === "/chat"
                    ? "text-accent-cyan"
                    : "text-accent-pink"
                  : "text-text-secondary hover:text-text-primary"
              }
            />
          </Link>
        );
      })}

      {/* Vertical zmind label */}
      <span
        className="mt-2 font-body text-[10px] font-semibold tracking-[2px] text-text-muted"
        style={{ writingMode: "vertical-rl" }}
      >
        zmind
      </span>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Settings */}
      <Link
        href="/settings"
        title="Settings"
        className="flex h-10 w-10 items-center justify-center"
      >
        <Settings size={22} className="text-text-muted hover:text-text-primary transition-colors" />
      </Link>
    </aside>
  );
}
