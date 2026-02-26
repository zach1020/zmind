import { Sparkles } from "lucide-react";

export default function TypingIndicator() {
  return (
    <div className="flex gap-2.5">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-cyan">
        <Sparkles size={16} className="text-bg-primary" />
      </div>
      <div className="flex items-center gap-1.5 rounded-[16px_16px_16px_4px] bg-bg-elevated px-4 py-3">
        <span
          className="inline-block h-2 w-2 rounded-full bg-accent-cyan"
          style={{ animation: "typingBounce 1.4s infinite 0s" }}
        />
        <span
          className="inline-block h-2 w-2 rounded-full bg-accent-purple opacity-70"
          style={{ animation: "typingBounce 1.4s infinite 0.2s" }}
        />
        <span
          className="inline-block h-2 w-2 rounded-full bg-accent-pink opacity-40"
          style={{ animation: "typingBounce 1.4s infinite 0.4s" }}
        />
      </div>
    </div>
  );
}
