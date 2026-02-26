import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey, unauthorized, badRequest } from "@/lib/utils";

export const maxDuration = 30;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!checkApiKey(req)) return unauthorized();
  const { id: clipId } = await params;

  const body = await req.json();
  const { image } = body;

  if (!image) return badRequest("image is required");

  // Strip data URL prefix if present (e.g. "data:image/png;base64,...")
  const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
  const buffer = Buffer.from(base64Data, "base64");

  const filename = `${clipId}/${Date.now()}.png`;

  const { error: uploadError } = await supabase.storage
    .from("clip-thumbnails")
    .upload(filename, buffer, {
      contentType: "image/png",
      upsert: true,
    });

  if (uploadError)
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500 }
    );

  const { data: urlData } = supabase.storage
    .from("clip-thumbnails")
    .getPublicUrl(filename);

  await supabase
    .from("clips")
    .update({ thumbnail_url: urlData.publicUrl })
    .eq("id", clipId);

  return NextResponse.json(
    { thumbnail_url: urlData.publicUrl },
    { status: 201 }
  );
}
