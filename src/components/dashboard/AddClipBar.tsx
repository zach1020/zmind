"use client";

import { useState } from "react";
import { Link, Loader2, Check } from "lucide-react";

import { API_KEY } from "@/lib/config";

interface AddClipBarProps {
  onClipAdded?: () => void;
}

export default function AddClipBar({ onClipAdded }: AddClipBarProps) {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit() {
    const trimmed = url.trim();
    if (!trimmed) return;

    // Basic URL validation — add protocol if missing
    let finalUrl = trimmed;
    if (!/^https?:\/\//i.test(finalUrl)) {
      finalUrl = "https://" + finalUrl;
    }

    setStatus("loading");
    setMessage("Fetching page & generating tags...");

    try {
      const res = await fetch("/api/clips/from-url", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": API_KEY,
        },
        body: JSON.stringify({ url: finalUrl }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to clip");
      }

      const data = await res.json();
      const tagNames = (data.tags || []).map((t: { name: string }) => t.name);

      setStatus("success");
      setMessage(
        `Clipped "${data.clip.title}"` +
          (tagNames.length ? ` — tagged: ${tagNames.join(", ")}` : "")
      );
      setUrl("");
      onClipAdded?.();

      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 4000);
    } catch (err) {
      setStatus("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
      setTimeout(() => {
        setStatus("idle");
        setMessage("");
      }, 3000);
    }
  }

  return (
    <div className="shrink-0">
      <div className="flex h-11 items-center gap-2 rounded-xl border border-border-subtle bg-bg-card px-3">
        <Link size={16} className="shrink-0 text-accent-cyan" />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
          placeholder="Paste a URL to clip..."
          disabled={status === "loading"}
          className="flex-1 bg-transparent font-body text-sm text-text-primary placeholder:text-text-muted focus:outline-none"
        />
        <button
          onClick={handleSubmit}
          disabled={!url.trim() || status === "loading"}
          className="flex h-7 items-center gap-1.5 rounded-lg bg-gradient-to-r from-accent-purple to-accent-pink px-3 font-body text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-40"
        >
          {status === "loading" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : status === "success" ? (
            <Check size={14} />
          ) : null}
          {status === "loading" ? "Clipping..." : "Clip"}
        </button>
      </div>
      {message && (
        <p
          className={`mt-1.5 font-body text-xs ${
            status === "success"
              ? "text-green-400"
              : status === "error"
                ? "text-accent-pink"
                : "text-accent-cyan"
          }`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
