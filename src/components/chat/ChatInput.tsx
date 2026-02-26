"use client";

import { useState } from "react";
import { ArrowUp, MessageCircle } from "lucide-react";

interface ChatInputProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [text, setText] = useState("");

  function handleSubmit() {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText("");
  }

  return (
    <div className="flex flex-col gap-2 px-7 py-3 pb-5">
      <div className="flex h-12 items-center gap-2.5 rounded-3xl border border-border-subtle bg-bg-elevated pl-[18px] pr-1.5 shadow-[0_0_16px_2px_#A855F730]">
        <MessageCircle size={18} className="text-text-muted" />
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Ask Claude about your notes..."
          disabled={disabled}
          className="flex-1 bg-transparent font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!text.trim() || disabled}
          className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-accent-purple to-accent-pink transition-opacity disabled:opacity-30"
        >
          <ArrowUp size={18} className="text-white" />
        </button>
      </div>
      <p className="text-center font-body text-[11px] text-text-muted">
        Claude can reference all your saved clips, notes, and bookmarks
      </p>
    </div>
  );
}
