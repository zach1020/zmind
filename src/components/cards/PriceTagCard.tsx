import type { Clip } from "@/lib/types";

export default function PriceTagCard({ clip }: { clip: Clip }) {
  return (
    <div className="group flex h-full items-center gap-2.5 overflow-hidden rounded-xl bg-bg-card p-3.5 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_#FF6EC720]">
      {clip.price && (
        <span className="rounded-md bg-accent-cyan px-2 py-1 font-body text-xs font-bold text-bg-primary">
          {clip.price}
        </span>
      )}
      <p className="font-body text-[13px] font-medium text-text-primary">
        {clip.title}
      </p>
    </div>
  );
}
