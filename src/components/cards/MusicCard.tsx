import { Play } from "lucide-react";
import type { Clip } from "@/lib/types";

export default function MusicCard({ clip }: { clip: Clip }) {
  return (
    <div className="group overflow-hidden rounded-xl bg-bg-card transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_#FF6EC720]">
      <div className="relative h-[140px] w-full overflow-hidden">
        {clip.thumbnail_url ? (
          <img
            src={clip.thumbnail_url}
            alt={clip.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-bg-elevated" />
        )}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-black/40">
            <Play size={20} className="text-white/80" fill="currentColor" />
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-1 p-3">
        <p className="font-body text-[13px] font-semibold text-text-primary line-clamp-2">
          {clip.title}
        </p>
        <p className="font-body text-[11px] text-text-muted">
          {clip.source}
        </p>
      </div>
    </div>
  );
}
