import { Github, Globe } from "lucide-react";
import type { Clip } from "@/lib/types";

export default function BookmarkCard({ clip }: { clip: Clip }) {
  const isGithub = clip.source?.toLowerCase().includes("github");
  const Icon = isGithub ? Github : Globe;

  return (
    <div className="group flex h-full flex-col justify-center gap-2 overflow-hidden rounded-xl bg-bg-card p-3.5 transition-all hover:scale-[1.02] hover:shadow-[0_0_20px_#FF6EC720]">
      <Icon size={20} className="text-text-secondary" />
      <p className="font-body text-[13px] font-semibold text-text-primary">
        {clip.title}
      </p>
      <p className="font-body text-[11px] text-accent-purple">
        {clip.source}
      </p>
    </div>
  );
}
