"use client";

import AppShell from "@/components/layout/AppShell";
import NotesPanel from "@/components/chat/NotesPanel";
import ChatView from "@/components/chat/ChatView";
import { useClips } from "@/hooks/useClips";

export default function ChatPage() {
  const { clips } = useClips();

  return (
    <AppShell>
      <div className="flex h-full">
        <NotesPanel clips={clips.slice(0, 10)} />
        <ChatView />
      </div>
    </AppShell>
  );
}
