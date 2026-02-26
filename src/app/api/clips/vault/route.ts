import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey, unauthorized, badRequest } from "@/lib/utils";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (!checkApiKey(req)) return unauthorized();

  const body = await req.json();
  if (!body.clip_id) return badRequest("clip_id is required");

  // Get the clip
  const { data: clip, error: clipError } = await supabase
    .from("clips")
    .select("*")
    .eq("id", body.clip_id)
    .single();

  if (clipError || !clip)
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });

  if (!clip.url)
    return badRequest("Clip has no URL to archive");

  if (clip.archive_path)
    return NextResponse.json({ message: "Already in vault", path: clip.archive_path });

  // Fetch the full page HTML
  let html: string;
  try {
    const res = await fetch(clip.url, {
      headers: { "User-Agent": "ZMind/1.0" },
      signal: AbortSignal.timeout(15000),
    });
    html = await res.text();
  } catch {
    return NextResponse.json({ error: "Failed to fetch page" }, { status: 502 });
  }

  // Upload to Supabase Storage
  const filename = `${clip.id}/${Date.now()}.html`;
  const buffer = Buffer.from(html);

  const { error: uploadError } = await supabase.storage
    .from("clip-archives")
    .upload(filename, buffer, {
      contentType: "text/html",
      upsert: true,
    });

  if (uploadError)
    return NextResponse.json({ error: uploadError.message }, { status: 500 });

  // Update clip with archive path
  await supabase
    .from("clips")
    .update({ archive_path: filename })
    .eq("id", clip.id);

  return NextResponse.json({ path: filename }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  if (!checkApiKey(req)) return unauthorized();

  const body = await req.json();
  if (!body.clip_id) return badRequest("clip_id is required");

  const { data: clip, error: clipError } = await supabase
    .from("clips")
    .select("id, archive_path")
    .eq("id", body.clip_id)
    .single();

  if (clipError || !clip)
    return NextResponse.json({ error: "Clip not found" }, { status: 404 });

  if (clip.archive_path) {
    // Remove file from storage
    await supabase.storage.from("clip-archives").remove([clip.archive_path]);
  }

  // Clear archive_path on the clip
  await supabase
    .from("clips")
    .update({ archive_path: null })
    .eq("id", body.clip_id);

  return NextResponse.json({ success: true });
}
