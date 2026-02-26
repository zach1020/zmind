import Anthropic from "@anthropic-ai/sdk";

if (!process.env.ANTHROPIC_API_KEY)
  throw new Error("Missing ANTHROPIC_API_KEY");

export const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateTags(
  title: string,
  url: string | null,
  content: string | null
): Promise<string[]> {
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 200,
    messages: [
      {
        role: "user",
        content: `Generate 2-5 short, lowercase tags for this web clip. Return ONLY a JSON array of strings.

Title: ${title}
URL: ${url || "N/A"}
Content preview: ${(content || "").slice(0, 500)}`,
      },
    ],
  });

  const text =
    message.content[0].type === "text" ? message.content[0].text : "";
  const match = text.match(/\[[\s\S]*\]/);
  if (!match) return [];
  try {
    return JSON.parse(match[0]);
  } catch {
    return [];
  }
}
