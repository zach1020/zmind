"use client";

import { useState, useCallback, useRef } from "react";
import type { Clip } from "@/lib/types";

import { API_KEY } from "@/lib/config";

export interface ChatMsg {
  id: string;
  role: "user" | "assistant";
  content: string;
  referencedClips?: Clip[];
}

export function useChat(conversationId?: string) {
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [referencedClips, setReferencedClips] = useState<Clip[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(
    async (text: string) => {
      const userMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      };
      setMessages((prev) => [...prev, userMsg]);
      setStreaming(true);

      const assistantMsg: ChatMsg = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "",
      };
      setMessages((prev) => [...prev, assistantMsg]);

      try {
        abortRef.current = new AbortController();
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-api-key": API_KEY,
          },
          body: JSON.stringify({
            message: text,
            conversation_id: conversationId,
          }),
          signal: abortRef.current.signal,
        });

        if (!res.ok || !res.body) {
          setStreaming(false);
          return;
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n\n");
          buffer = lines.pop() || "";

          for (const line of lines) {
            if (!line.startsWith("data: ")) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.text) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMsg.id
                      ? { ...m, content: m.content + data.text }
                      : m
                  )
                );
              }
              if (data.referenced_clips) {
                setReferencedClips(data.referenced_clips);
              }
            } catch {
              // skip malformed chunks
            }
          }
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
      } finally {
        setStreaming(false);
      }
    },
    [conversationId]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  return { messages, streaming, referencedClips, sendMessage, stopStreaming };
}
