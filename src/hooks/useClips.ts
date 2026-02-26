"use client";

import { useState, useEffect, useCallback } from "react";
import type { Clip } from "@/lib/types";

import { API_KEY } from "@/lib/config";

export function useClips(
  query?: string,
  random?: boolean,
  favoritesOnly?: boolean,
  archivedOnly?: boolean
) {
  const [clips, setClips] = useState<Clip[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClips = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (random) params.set("random", "true");
    if (favoritesOnly) params.set("favorited", "true");
    if (archivedOnly) params.set("archived", "true");
    params.set("limit", "500");

    try {
      const res = await fetch(`/api/clips?${params}`, {
        headers: { "x-api-key": API_KEY },
      });
      if (res.ok) {
        setClips(await res.json());
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  }, [query, random, favoritesOnly, archivedOnly]);

  useEffect(() => {
    fetchClips();
  }, [fetchClips]);

  return { clips, loading, refetch: fetchClips };
}
