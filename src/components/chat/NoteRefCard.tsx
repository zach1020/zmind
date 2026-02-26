import type { Clip } from "@/lib/types";

export default function NoteRefCard({
  clip,
  highlighted,
}: {
  clip: Clip;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-1.5 rounded-lg bg-bg-card p-2.5 ${
        highlighted
          ? "border border-[#FF6EC730]"
          : "border border-transparent"
      }`}
    >
      <p className="font-body text-xs font-semibold text-text-primary line-clamp-1">
        {clip.title}
      </p>
      <p className="font-body text-[10px] text-accent-pink">
        {clip.source || clip.url || clip.type}
      </p>
      {clip.excerpt && (
        <p className="font-body text-[11px] leading-[1.3] text-text-secondary line-clamp-2">
          {clip.excerpt}
        </p>
      )}
    </div>
  );
}
