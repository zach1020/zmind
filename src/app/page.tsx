"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import TopBar from "@/components/layout/TopBar";
import AddClipBar from "@/components/dashboard/AddClipBar";
import AddNoteCard from "@/components/dashboard/AddNoteCard";
import MasonryGrid from "@/components/dashboard/MasonryGrid";
import ClipModal from "@/components/dashboard/ClipModal";
import { useClips } from "@/hooks/useClips";
import { useSearch } from "@/hooks/useSearch";
import type { Clip } from "@/lib/types";

import { API_KEY } from "@/lib/config";

type Tab = "everything" | "chat";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<Tab>("everything");
  const { query, setQuery, debouncedQuery } = useSearch();
  const [selectedClip, setSelectedClip] = useState<Clip | null>(null);

  const { clips, loading, refetch } = useClips(debouncedQuery || undefined);

  function handleTabChange(tab: Tab) {
    if (tab === "chat") {
      router.push("/chat");
      return;
    }
    setActiveTab(tab);
  }

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

  async function handleToggleVault(clip: Clip) {
    const res = await fetch("/api/clips/vault", {
      method: clip.archive_path ? "DELETE" : "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": API_KEY,
      },
      body: JSON.stringify({ clip_id: clip.id }),
    });
    if (res.ok) {
      refetch();
    }
  }

  return (
    <AppShell>
      <TopBar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        searchQuery={query}
        onSearchChange={setQuery}
      />

      <div className="flex flex-1 flex-col gap-4 overflow-hidden px-8 pb-8">
        <AddClipBar onClipAdded={refetch} />

        {loading ? (
          <div className="flex flex-1 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-pink border-t-transparent" />
          </div>
        ) : (
          <MasonryGrid
            clips={clips}
            onClipClick={setSelectedClip}
            onClipDelete={handleDelete}
            onToggleFavorite={handleToggleFavorite}
            onSendToVault={handleToggleVault}
            noteCard={<AddNoteCard onNoteAdded={refetch} />}
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
