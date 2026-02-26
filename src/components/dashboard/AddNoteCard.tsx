"use client";

import { useState } from "react";

import { API_KEY } from "@/lib/config";

interface AddNoteCardProps {
  onNoteAdded?: () => void;
}

export default function AddNoteCard({ onNoteAdded }: AddNoteCardProps) {
  const [text, setText] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit() {
    if (!text.trim()) return;
    setSaving(true);
    try {
      const res = await fetch("/api/clips", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({
          title: text.slice(0, 60),
          type: "note",
          content: text,
        }),
      });
      if (res.ok) {
        setText("");
        onNoteAdded?.();
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="w-full rounded-xl border border-white/[0.06] bg-bg-card/60 backdrop-blur-xl p-4">
      <p className="font-body text-[11px] font-bold tracking-[1px] text-accent-pink">
        ADD A NEW NOTE
      </p>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Start typing here..."
        className="mt-2 w-full resize-none bg-transparent font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        rows={3}
        onKeyDown={(e) => {
          if (e.key === "Enter" && e.metaKey) handleSubmit();
        }}
      />
      {text.trim() && (
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="mt-2 rounded-lg bg-gradient-to-r from-accent-purple to-accent-pink px-3 py-1.5 font-body text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save (Cmd+Enter)"}
        </button>
      )}
    </div>
  );
}
