import type { Clip } from "@/lib/types";

export default function QuoteCard({ clip }: { clip: Clip }) {
  return (
    <div className="group flex flex-col gap-2.5 rounded-xl border border-[#A855F730] bg-gradient-to-br from-bg-elevated to-[#2D1B69] p-4 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_#A855F730]">
      <span className="font-heading text-[32px] font-extrabold leading-none text-accent-purple">
        &ldquo;
      </span>
      <p className="font-body text-sm font-medium italic leading-[1.4] text-text-primary">
        {clip.content || clip.excerpt}
      </p>
      {clip.author && (
        <p className="font-body text-xs text-text-secondary">
          - {clip.author}
        </p>
      )}
    </div>
  );
}
