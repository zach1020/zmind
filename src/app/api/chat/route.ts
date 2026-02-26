import { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";
import { anthropic } from "@/lib/claude";
import { checkApiKey, unauthorized, badRequest } from "@/lib/utils";

export const maxDuration = 60;

async function findRelevantClips(message: string) {
  const selectFields = "id, title, url, source, type, excerpt, content, clip_tags(tag_id, tags(name))";

  // 1. Try full-text search (best match)
  const words = message.replace(/[^\w\s]/g, "").split(/\s+/).filter((w) => w.length > 2);
  let ftsClips: unknown[] = [];
  if (words.length > 0) {
    // Use plain mode with OR so partial matches work
    const tsquery = words.join(" | ");
    const { data } = await supabase
      .from("clips")
      .select(selectFields)
      .textSearch("fts", tsquery, { type: "plain" })
      .limit(8);
    ftsClips = data || [];
  }

  // 2. Also search by tags (ILIKE on tag names)
  let tagClips: unknown[] = [];
  if (words.length > 0) {
    const { data: matchingTags } = await supabase
      .from("tags")
      .select("id, name")
      .or(words.map((w) => `name.ilike.%${w}%`).join(","))
      .limit(20);

    if (matchingTags && matchingTags.length > 0) {
      const tagIds = matchingTags.map((t) => t.id);
      const { data: clipIds } = await supabase
        .from("clip_tags")
        .select("clip_id")
        .in("tag_id", tagIds)
        .limit(10);

      if (clipIds && clipIds.length > 0) {
        const ids = [...new Set(clipIds.map((ct) => ct.clip_id))];
        const { data } = await supabase
          .from("clips")
          .select(selectFields)
          .in("id", ids)
          .limit(8);
        tagClips = data || [];
      }
    }
  }

  // 3. Also try ILIKE on title for direct matches
  let titleClips: unknown[] = [];
  if (words.length > 0) {
    const { data } = await supabase
      .from("clips")
      .select(selectFields)
      .or(words.map((w) => `title.ilike.%${w}%`).join(","))
      .limit(5);
    titleClips = data || [];
  }

  // Merge and dedupe, prioritizing FTS results
  const seen = new Set<string>();
  const merged: unknown[] = [];
  for (const clip of [...ftsClips, ...tagClips, ...titleClips]) {
    const c = clip as { id: string };
    if (!seen.has(c.id)) {
      seen.add(c.id);
      merged.push(clip);
    }
  }

  return merged.slice(0, 10);
}

async function getCollectionOverview() {
  const { count } = await supabase.from("clips").select("*", { count: "exact", head: true });

  // Get recent clips for general context
  const { data: recentClips } = await supabase
    .from("clips")
    .select("title, type, source, url")
    .order("created_at", { ascending: false })
    .limit(15);

  // Get popular tags
  const { data: tagCounts } = await supabase
    .from("clip_tags")
    .select("tags(name)")
    .limit(500);

  const tagFreq: Record<string, number> = {};
  for (const ct of tagCounts || []) {
    const name = ((ct as unknown) as { tags: { name: string } }).tags?.name;
    if (name) tagFreq[name] = (tagFreq[name] || 0) + 1;
  }
  const topTags = Object.entries(tagFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([name, count]) => `${name} (${count})`);

  return { totalClips: count || 0, recentClips: recentClips || [], topTags };
}

export async function POST(req: NextRequest) {
  if (!checkApiKey(req)) return unauthorized();

  const body = await req.json();
  if (!body.message) return badRequest("message is required");

  const conversationId = body.conversation_id;

  // Find relevant clips via multi-strategy search
  const relevantClips = await findRelevantClips(body.message);

  // Get collection overview for general awareness
  const overview = await getCollectionOverview();

  // Build context from matched clips
  const clipContext = (relevantClips as { id: string; type: string; title: string; source: string; url: string; content: string; excerpt: string; clip_tags: { tags: { name: string } }[] }[])
    .map((c) => {
      const tags = (c.clip_tags || []).map((ct) => ct.tags?.name).filter(Boolean).join(", ");
      return `[${c.type}] "${c.title}" (${c.source || c.url || "no source"})${tags ? `\nTags: ${tags}` : ""}\n${(c.content || c.excerpt || "").slice(0, 400)}`;
    })
    .join("\n\n");

  // Build overview section
  const recentTitles = overview.recentClips
    .map((c) => `- [${c.type}] ${c.title} (${c.source || c.url || ""})`)
    .join("\n");

  // Get conversation history if exists
  let history: { role: "user" | "assistant"; content: string }[] = [];
  if (conversationId) {
    const { data: messages } = await supabase
      .from("chat_messages")
      .select("role, content")
      .eq("conversation_id", conversationId)
      .order("created_at")
      .limit(20);
    history = (messages || []) as { role: "user" | "assistant"; content: string }[];
  }

  // Save user message
  const clipIds = (relevantClips as { id: string }[]).map((c) => c.id);
  if (conversationId) {
    await supabase.from("chat_messages").insert({
      conversation_id: conversationId,
      role: "user",
      content: body.message,
      referenced_clip_ids: clipIds,
    });
  }

  // Stream response from Claude
  const stream = anthropic.messages.stream({
    model: "claude-sonnet-4-20250514",
    max_tokens: 1024,
    system: `You are ZMind, an AI assistant that helps users explore and understand their saved web clips, notes, and bookmarks.

The user's collection has ${overview.totalClips} clips total.
Top tags: ${overview.topTags.join(", ")}

Recent clips in their collection:
${recentTitles}

${clipContext ? `Clips most relevant to this message:\n\n${clipContext}` : "No clips directly matched this specific query, but you can still discuss the collection based on the overview above."}

Be concise, helpful, and reference specific clips when relevant. If the user asks about their collection in general, use the overview and recent clips to give a meaningful answer. Use markdown formatting.`,
    messages: [
      ...history,
      { role: "user", content: body.message },
    ],
  });

  const encoder = new TextEncoder();
  const readable = new ReadableStream({
    async start(controller) {
      let fullResponse = "";

      stream.on("text", (text) => {
        fullResponse += text;
        controller.enqueue(
          encoder.encode(`data: ${JSON.stringify({ text })}\n\n`)
        );
      });

      stream.on("end", async () => {
        // Save assistant message
        if (conversationId) {
          await supabase.from("chat_messages").insert({
            conversation_id: conversationId,
            role: "assistant",
            content: fullResponse,
            referenced_clip_ids: clipIds,
          });
        }

        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ done: true, referenced_clips: relevantClips || [] })}\n\n`
          )
        );
        controller.close();
      });

      stream.on("error", (err) => {
        controller.enqueue(
          encoder.encode(
            `data: ${JSON.stringify({ error: err.message })}\n\n`
          )
        );
        controller.close();
      });
    },
  });

  return new Response(readable, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
