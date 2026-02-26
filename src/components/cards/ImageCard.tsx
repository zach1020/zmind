import type { Clip } from "@/lib/types";

export default function ImageCard({ clip }: { clip: Clip }) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-xl bg-bg-card/60 backdrop-blur-xl border border-white/[0.06] transition-all hover:shadow-[0_0_20px_#FF6EC720]">
      {clip.thumbnail_url && (
        <div className="min-h-0 flex-1 w-full overflow-hidden">
          <img
            src={clip.thumbnail_url}
            alt={clip.title}
            className="h-full w-full object-cover opacity-50 transition-all duration-300 group-hover:opacity-100 group-hover:scale-105"
          />
        </div>
      )}
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
