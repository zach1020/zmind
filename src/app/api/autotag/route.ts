import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateTags } from "@/lib/claude";
import { checkApiKey, unauthorized, badRequest } from "@/lib/utils";

export async function POST(req: NextRequest) {
  if (!checkApiKey(req)) return unauthorized();

  const body = await req.json();
  if (!body.clip_id) return badRequest("clip_id is required");

  // Get clip
  const { data: clip, error: clipError } = await supabase
    .from("clips")
    .select("*")
    .eq("id", body.clip_id)
    .single();

  if (clipError || !clip)
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });

  // Generate tags with Claude
  const tagNames = await generateTags(clip.title, clip.url, clip.content);

  // Create tags and link to clip
  const createdTags = [];
  for (const name of tagNames) {
    const { data: tag } = await supabase
      .from("tags")
      .upsert({ name: name.toLowerCase() }, { onConflict: "name" })
      .select()
      .single();

    if (tag) {
      await supabase
        .from("clip_tags")
        .upsert({ clip_id: body.clip_id, tag_id: tag.id });
      createdTags.push(tag);
    }
  }

  return NextResponse.json({ tags: createdTags });
}
