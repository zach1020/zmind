"use client";

import { Trash2, Bookmark, Archive } from "lucide-react";
import type { Clip } from "@/lib/types";
import ArticleCard from "@/components/cards/ArticleCard";
import VideoCard from "@/components/cards/VideoCard";
import ImageCard from "@/components/cards/ImageCard";
import BookmarkCard from "@/components/cards/BookmarkCard";
import NoteCard from "@/components/cards/NoteCard";
import QuoteCard from "@/components/cards/QuoteCard";
import MusicCard from "@/components/cards/MusicCard";
import ToolCard from "@/components/cards/ToolCard";
import PriceTagCard from "@/components/cards/PriceTagCard";
import WebsiteCard from "@/components/cards/WebsiteCard";

interface ClipCardProps {
  clip: Clip;
  onClick?: () => void;
  onDelete?: () => void;
  onToggleFavorite?: () => void;
  onSendToVault?: () => void;
}

const cardMap: Record<string, React.ComponentType<{ clip: Clip }>> = {
  article: ArticleCard,
  video: VideoCard,
  image: ImageCard,
  bookmark: BookmarkCard,
  note: NoteCard,
  quote: QuoteCard,
  music: MusicCard,
  tool: ToolCard,
  price: PriceTagCard,
  website: WebsiteCard,
};

// Three consistent size tiers for masonry
const sizeClass: Record<string, string> = {
  bookmark: "h-[100px]",
  tool: "h-[100px]",
  price: "h-[100px]",
  article: "h-[200px]",
  note: "h-[200px]",
  quote: "h-[200px]",
  website: "h-[200px]",
  video: "h-[280px]",
  image: "h-[280px]",
  music: "h-[280px]",
};

export default function ClipCard({ clip, onClick, onDelete, onToggleFavorite, onSendToVault }: ClipCardProps) {
  const Card = cardMap[clip.type] || BookmarkCard;

  return (
    <div
      className="group/card animate-fade-in-up relative cursor-pointer break-inside-avoid rounded-xl p-[2px] transition-all duration-300 hover:neon-border"
      onClick={onClick}
    >
      <div className={`relative rounded-[10px] overflow-hidden ${sizeClass[clip.type] || "h-[200px]"}`}>
      <Card clip={clip} />

      {/* Vault badge */}
      {clip.archive_path && (
        <div className="absolute left-2 top-2 flex h-5 items-center gap-1 rounded bg-accent-cyan/20 px-1.5 backdrop-blur-sm">
          <Archive size={10} className="text-accent-cyan" />
          <span className="font-body text-[9px] font-semibold text-accent-cyan">VAULT</span>
        </div>
      )}

      {/* Hover actions */}
      <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover/card:opacity-100">
        {onSendToVault && clip.url && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSendToVault();
            }}
            className={`flex h-7 w-7 items-center justify-center rounded-lg backdrop-blur-sm transition-colors ${
              clip.archive_path
                ? "bg-accent-cyan/80 text-white hover:bg-red-500/60"
                : "bg-black/60 text-white hover:bg-accent-cyan/60"
            }`}
            title={clip.archive_path ? "Remove from Vault" : "Send to Vault"}
          >
            <Archive size={14} />
          </button>
        )}
        {onToggleFavorite && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite();
            }}
            className={`flex h-7 w-7 items-center justify-center rounded-lg backdrop-blur-sm transition-colors ${
              clip.favorited
                ? "bg-accent-pink/80 text-white"
                : "bg-black/60 text-white hover:bg-accent-pink/60"
            }`}
            title={clip.favorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Bookmark size={14} fill={clip.favorited ? "currentColor" : "none"} />
          </button>
        )}
        {onDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-black/60 backdrop-blur-sm transition-colors hover:bg-red-500/80"
            title="Delete"
          >
            <Trash2 size={14} className="text-white" />
          </button>
        )}
      </div>
      </div>
    </div>
  );
}
