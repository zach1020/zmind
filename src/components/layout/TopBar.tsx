"use client";

import { Search } from "lucide-react";

type Tab = "everything" | "chat";

interface TopBarProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

const tabs: { id: Tab; label: string }[] = [
  { id: "everything", label: "Everything" },
  { id: "chat", label: "AI Chat" },
];

export default function TopBar({
  activeTab,
  onTabChange,
  searchQuery,
  onSearchChange,
}: TopBarProps) {
  return (
    <header className="flex h-[70px] w-full items-center justify-between px-8 py-4">
      {/* Search Bar */}
      <div className="flex h-[38px] w-[400px] items-center gap-2.5 rounded-xl border border-border-subtle bg-bg-elevated px-3.5">
        <Search size={18} className="text-text-muted" />
        <input
          type="text"
          placeholder="Search my mind..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full bg-transparent font-heading text-base font-medium italic text-text-primary placeholder:text-text-muted focus:outline-none"
        />
      </div>

      {/* Nav Tabs */}
      <nav className="flex h-[38px] items-center gap-6">
        {tabs.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`font-body text-sm transition-colors ${
              activeTab === id
                ? id === "chat"
                  ? "font-semibold text-accent-cyan"
                  : "font-semibold text-accent-pink"
                : "font-medium text-text-secondary hover:text-text-primary"
            }`}
          >
            {label}
          </button>
        ))}
      </nav>
    </header>
  );
}
