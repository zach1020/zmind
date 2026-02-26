"use client";

import { useState } from "react";
import { X, Trash2, ExternalLink } from "lucide-react";
import type { Clip } from "@/lib/types";

import { API_KEY } from "@/lib/config";

interface ClipModalProps {
  clip: Clip;
  onClose: () => void;
  onDeleted?: () => void;
}

export default function ClipModal({ clip, onClose, onDeleted }: ClipModalProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!confirm("Delete this clip?")) return;
    setDeleting(true);
    try {
      await fetch(`/api/clips/${clip.id}`, {
        method: "DELETE",
        headers: { "x-api-key": API_KEY },
      });
      onDeleted?.();
      onClose();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-border-subtle bg-bg-surface"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border-subtle p-4">
          <div className="min-w-0 flex-1">
            <h2 className="font-heading text-lg font-bold text-text-primary truncate">
              {clip.title}
            </h2>
            {clip.source && (
              <p className="mt-1 font-body text-xs text-text-muted">
                {clip.source}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 ml-4">
            {clip.url && (
              <a
                href={clip.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-bg-elevated"
                title="Open original"
              >
                <ExternalLink size={16} className="text-text-secondary" />
              </a>
            )}
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-text-secondary hover:bg-red-500/20 hover:text-red-400 transition-colors"
              title="Delete clip"
            >
              <Trash2 size={16} />
            </button>
            <button
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-bg-elevated"
            >
              <X size={18} className="text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-4">
          {clip.thumbnail_url && (
            <div className="mb-4 overflow-hidden rounded-lg">
              <img
                src={clip.thumbnail_url}
                alt={clip.title}
                className="w-full max-h-[300px] object-cover"
              />
            </div>
          )}
          {clip.archive_path ? (
            <iframe
              src={`/api/clips/archive?path=${encodeURIComponent(clip.archive_path)}`}
              className="h-[70vh] w-full rounded-lg border border-border-subtle"
              sandbox="allow-same-origin"
              title={clip.title}
            />
          ) : clip.content ? (
            <div className="font-body text-sm leading-relaxed text-text-secondary">
              {clip.content}
            </div>
          ) : clip.url ? (
            <a
              href={clip.url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-body text-sm text-accent-cyan hover:underline"
            >
              Open original page
            </a>
          ) : (
            <p className="font-body text-sm text-text-muted">
              No content available
            </p>
          )}
        </div>

        {clip.tags && clip.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 border-t border-border-subtle p-4">
            {clip.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-accent-purple/20 px-2.5 py-0.5 font-body text-xs text-accent-purple"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
