import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey, unauthorized, badRequest } from "@/lib/utils";

export async function GET(req: NextRequest) {
  if (!checkApiKey(req)) return unauthorized();

  const { data, error } = await supabase
    .from("tags")
    .select("*")
    .order("name");

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  if (!checkApiKey(req)) return unauthorized();

  const body = await req.json();
  if (!body.name) return badRequest("name is required");

  // Upsert tag and link to clip if clip_id provided
  const { data: tag, error } = await supabase
    .from("tags")
    .upsert({ name: body.name.toLowerCase(), color: body.color || null }, {
      onConflict: "name",
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Link to clip if provided
  if (body.clip_id && tag) {
    await supabase
      .from("clip_tags")
      .upsert({ clip_id: body.clip_id, tag_id: tag.id });
  }

  return NextResponse.json(tag, { status: 201 });
}
