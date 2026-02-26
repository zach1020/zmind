"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import type { Clip } from "@/lib/types";
import NoteRefCard from "./NoteRefCard";

interface NotesPanelProps {
  clips: Clip[];
}

export default function NotesPanel({ clips }: NotesPanelProps) {
  const [filter, setFilter] = useState("");

  const filtered = filter
    ? clips.filter((c) =>
        c.title.toLowerCase().includes(filter.toLowerCase())
      )
    : clips;

  return (
    <aside className="flex h-full w-[300px] flex-col gap-4 border-r border-border-subtle bg-bg-surface px-4 py-5">
      <div className="flex items-center justify-between">
        <h2 className="font-heading text-sm font-bold text-text-primary">
          Referenced Notes
        </h2>
        <span className="flex h-[22px] items-center justify-center rounded-full bg-accent-purple px-2.5 font-body text-[10px] font-semibold text-white">
          {clips.length}
        </span>
      </div>

      <div className="flex h-[34px] items-center gap-2 rounded-lg bg-bg-elevated px-2.5">
        <Search size={14} className="text-text-muted" />
        <input
          type="text"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          placeholder="Filter notes..."
          className="w-full bg-transparent font-body text-xs text-text-primary placeholder:text-text-muted focus:outline-none"
        />
      </div>

      <div className="flex flex-1 flex-col gap-2.5 overflow-y-auto">
        {filtered.map((clip) => (
          <NoteRefCard key={clip.id} clip={clip} highlighted />
        ))}
      </div>
    </aside>
  );
}
