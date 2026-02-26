import type { Clip } from "@/lib/types";

export default function NoteCard({ clip }: { clip: Clip }) {
  return (
    <div className="group flex h-full flex-col gap-1.5 overflow-hidden rounded-xl border border-[#FF6EC720] bg-bg-card p-3.5 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_#FF6EC720]">
      <p className="font-body text-xs font-bold tracking-[0.5px] text-accent-pink">
        {clip.title}
      </p>
      {clip.content && (
        <p className="font-body text-[13px] leading-[1.4] text-text-secondary line-clamp-4">
          {clip.content}
        </p>
      )}
    </div>
  );
}
