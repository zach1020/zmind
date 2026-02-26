"use client";

import { useState } from "react";
import { Archive } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import MasonryGrid from "@/components/dashboard/MasonryGrid";
import ClipModal from "@/components/dashboard/ClipModal";
import { useClips } from "@/hooks/useClips";
import type { Clip } from "@/lib/types";

import { API_KEY } from "@/lib/config";

export default function VaultPage() {
  const { clips, loading, refetch } = useClips(undefined, false, false, true);
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  async function handleDelete(clip: Clip) {
    if (!confirm(`Delete "${clip.title}"?`)) return;
    await fetch(`/api/clips/${clip.id}`, {
      method: "DELETE",
      headers: { "x-api-key": API_KEY },
    });
    refetch();
  }

  async function handleToggleFavorite(clip: Clip) {
    await fetch(`/api/clips/${clip.id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ favorited: !clip.favorited }),
    });
    refetch();
  }

  return (
    <AppShell>
      <div className="flex h-[70px] items-center gap-3 px-8">
        <Archive size={20} className="text-accent-cyan" />
        <h1 className="font-heading text-lg font-bold text-text-primary">
          Vault
        </h1>
        <span className="font-body text-sm text-text-muted">
          Full page archives
        </span>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden px-8 pb-8">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-cyan border-t-transparent" />
          </div>
        ) : clips.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Archive size={40} className="mx-auto mb-3 text-text-muted" />
              <p className="font-heading text-lg font-bold text-text-secondary">
                Vault is empty
              </p>
              <p className="mt-2 max-w-xs font-body text-sm text-text-muted">
                Hover over any clip on the Everything page and click the archive
                icon to save a full copy here
              </p>
            </div>
          </div>
        ) : (
          <MasonryGrid
            clips={clips}
            onClipClick={setSelectedClip}
            onClipDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
          />
        )}
      </div>

      {selectedClip && (
        <ClipModal
          clip={selectedClip}
          onClose={() => setSelectedClip(null)}
          onDeleted={refetch}
        />
      )}
    </AppShell>
  );
}
