import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey, unauthorized, badRequest } from "@/lib/utils";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (!checkApiKey(req)) return unauthorized();

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const clipId = formData.get("clip_id") as string | null;

  if (!file) return badRequest("file is required");
  if (!clipId) return badRequest("clip_id is required");

  const filename = `${clipId}/${Date.now()}.html`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage
    .from("clip-archives")
    .upload(filename, buffer, {
      contentType: "text/html",
      upsert: true,
    });

  if (uploadError)
    return NextResponse.json(
      { error: uploadError.message },
      { status: 500 }
    );

  // Update clip with archive path
  await supabase
    .from("clips")
    .update({ archive_path: filename })
    .eq("id", clipId);

  return NextResponse.json({ path: filename }, { status: 201 });
}
