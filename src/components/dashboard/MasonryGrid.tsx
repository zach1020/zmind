"use client";

import type { ReactNode } from "react";
import type { Clip } from "@/lib/types";
import ClipCard from "./ClipCard";

interface MasonryGridProps {
  clips: Clip[];
  onClipClick?: (clip: Clip) => void;
  onClipDelete?: (clip: Clip) => void;
  onToggleFavorite?: (clip: Clip) => void;
  onSendToVault?: (clip: Clip) => void;
  noteCard?: ReactNode;
}

export default function MasonryGrid({ clips, onClipClick, onClipDelete, onToggleFavorite, onSendToVault, noteCard }: MasonryGridProps) {
  if (clips.length === 0) {
    return (
      <div className="flex-1 overflow-y-auto overflow-x-hidden">
        <div className="p-4" style={{ columns: 4, columnGap: "16px" }}>
        {noteCard && (
          <div className="mb-4 break-inside-avoid">{noteCard}</div>
        )}
        <div className="col-span-full flex items-center justify-center py-16">
          <div className="text-center">
            <p className="font-heading text-lg font-bold text-text-secondary">
              No clips yet
            </p>
            <p className="mt-2 font-body text-sm text-text-muted">
              Paste a URL above to start clipping
            </p>
          </div>
        </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto overflow-x-hidden">
      <div
        className="p-4"
        style={{ columns: 4, columnGap: "16px" }}
      >
        {noteCard && (
          <div className="mb-4 break-inside-avoid">{noteCard}</div>
        )}
        {clips.map((clip) => (
          <div key={clip.id} className="mb-4 break-inside-avoid">
            <ClipCard
              clip={clip}
              onClick={() => onClipClick?.(clip)}
              onDelete={() => onClipDelete?.(clip)}
              onToggleFavorite={() => onToggleFavorite?.(clip)}
              onSendToVault={() => onSendToVault?.(clip)}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
