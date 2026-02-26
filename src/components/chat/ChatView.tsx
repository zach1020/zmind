"use client";

import { useEffect, useRef } from "react";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import TypingIndicator from "./TypingIndicator";
import ChatInput from "./ChatInput";
import { useChat } from "@/hooks/useChat";

interface ChatViewProps {
  conversationId?: string;
}

export default function ChatView({ conversationId }: ChatViewProps) {
  const { messages, streaming, sendMessage } = useChat(conversationId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, streaming]);

  return (
    <div className="flex h-full flex-1 flex-col">
      <ChatHeader />

      <div
        ref={scrollRef}
        className="flex flex-1 flex-col gap-5 overflow-y-auto px-7 py-6"
      >
        {messages.length === 0 && (
          <div className="flex flex-1 items-center justify-center">
            <p className="font-body text-sm text-text-muted">
              Ask Claude about your saved clips and notes...
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}
        {streaming &&
          messages[messages.length - 1]?.content === "" && (
            <TypingIndicator />
          )}
      </div>

      <ChatInput onSend={sendMessage} disabled={streaming} />
    </div>
  );
}
