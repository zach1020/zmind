"use client";

import { useState } from "react";
import { Bookmark } from "lucide-react";
import AppShell from "@/components/layout/AppShell";
import MasonryGrid from "@/components/dashboard/MasonryGrid";
import ClipModal from "@/components/dashboard/ClipModal";
import { useClips } from "@/hooks/useClips";
import type { Clip } from "@/lib/types";

import { API_KEY } from "@/lib/config";

export default function FavoritesPage() {
  const { clips, loading, refetch } = useClips(undefined, false, true);
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

  async function handleSendToVault(clip: Clip) {
    const res = await fetch("/api/clips/vault", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ clip_id: clip.id }),
    });
    if (res.ok) refetch();
  }

  return (
    <AppShell>
      <div className="flex h-[70px] items-center gap-3 px-8">
        <Bookmark size={20} className="text-accent-pink" />
        <h1 className="font-heading text-lg font-bold text-text-primary">
          Favorites
        </h1>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden px-8 pb-8">
        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-pink border-t-transparent" />
          </div>
        ) : clips.length === 0 ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="text-center">
              <Bookmark size={40} className="mx-auto mb-3 text-text-muted" />
              <p className="font-heading text-lg font-bold text-text-secondary">
                No favorites yet
              </p>
              <p className="mt-2 font-body text-sm text-text-muted">
                Hover over any clip and click the bookmark icon to add it here
              </p>
            </div>
          </div>
        ) : (
          <MasonryGrid
            clips={clips}
            onClipClick={setSelectedClip}
            onClipDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
            onSendToVault={handleSendToVault}
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
