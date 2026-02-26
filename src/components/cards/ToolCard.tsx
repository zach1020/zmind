import { Code } from "lucide-react";
import type { Clip } from "@/lib/types";

export default function ToolCard({ clip }: { clip: Clip }) {
  return (
    <div className="group flex h-full flex-col justify-center gap-1.5 overflow-hidden rounded-xl bg-bg-card p-3.5 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_#FF6EC720]">
      <div className="flex items-center gap-2">
        <Code size={16} className="text-accent-cyan" />
        <p className="font-body text-[13px] font-semibold text-text-primary">
          {clip.title}
        </p>
      </div>
      <p className="font-body text-[11px] text-text-muted">
        {clip.source}
      </p>
    </div>
  );
}
