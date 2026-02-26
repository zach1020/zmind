import { Sparkles } from "lucide-react";

export default function ChatHeader() {
  return (
    <header className="flex h-[60px] items-center justify-between border-b border-border-subtle px-7">
      <div className="flex items-center gap-3">
        <Sparkles size={20} className="text-accent-cyan" />
        <h1 className="font-heading text-lg font-bold text-text-primary">
          Chat with your Notes
        </h1>
      </div>
      <span className="rounded-full bg-accent-purple/20 px-3 py-1 font-body text-xs font-semibold text-accent-purple">
        Powered by Claude
      </span>
    </header>
  );
}
