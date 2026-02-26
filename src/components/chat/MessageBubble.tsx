import { Sparkles } from "lucide-react";
import type { ChatMsg } from "@/hooks/useChat";

export default function MessageBubble({ msg }: { msg: ChatMsg }) {
  if (msg.role === "user") {
    return (
      <div className="flex justify-end animate-slide-in">
        <div className="max-w-[420px] rounded-[16px_16px_4px_16px] bg-gradient-to-br from-accent-purple to-accent-pink px-4 py-2.5">
          <p className="font-body text-sm leading-[1.4] text-white">
            {msg.content}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex gap-2.5 animate-slide-in">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent-cyan">
        <Sparkles size={16} className="text-bg-primary" />
      </div>
      <div className="max-w-[560px] rounded-[16px_16px_16px_4px] bg-bg-elevated px-4 py-3">
        <div className="font-body text-sm leading-[1.5] text-text-primary whitespace-pre-wrap">
          {msg.content}
        </div>
      </div>
    </div>
  );
}
