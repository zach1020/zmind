import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { checkApiKey, unauthorized, badRequest } from "@/lib/utils";

export async function GET(req: NextRequest) {
  if (!checkApiKey(req)) return unauthorized();

  const q = req.nextUrl.searchParams.get("q");
  const type = req.nextUrl.searchParams.get("type");
  const limit = parseInt(req.nextUrl.searchParams.get("limit") || "50");
  const offset = parseInt(req.nextUrl.searchParams.get("offset") || "0");
  const random = req.nextUrl.searchParams.get("random") === "true";
  const favorited = req.nextUrl.searchParams.get("favorited") === "true";

  let query = supabase
    .from("clips")
    .select("*, clip_tags(tag_id, tags(*))")
    .range(offset, offset + limit - 1);

  if (q) {
    query = query.textSearch("fts", q, { type: "websearch" });
  } else if (random) {
    // For random ordering, use RPC or a workaround
    const { data, error } = await supabase.rpc("get_random_clips", {
      lim: limit,
    });
    if (error) {
      // Fallback: just get clips ordered by created_at
      const fallback = await supabase
        .from("clips")
        .select("*, clip_tags(tag_id, tags(*))")
        .order("created_at", { ascending: false })
        .limit(limit);
      return NextResponse.json(fallback.data || []);
    }
    return NextResponse.json(data || []);
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (type) {
    query = query.eq("type", type);
  }

  if (favorited) {
    query = query.eq("favorited", true);
  }

  const archived = req.nextUrl.searchParams.get("archived") === "true";
  if (archived) {
    query = query.not("archive_path", "is", null);
  }

  const { data, error } = await query;
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Flatten tags
  const clips = (data || []).map((clip) => ({
    ...clip,
    tags: (clip.clip_tags || []).map(
      (ct: { tags: unknown }) => ct.tags
    ),
    clip_tags: undefined,
  }));

  return NextResponse.json(clips);
}

export async function POST(req: NextRequest) {
  if (!checkApiKey(req)) return unauthorized();

  const body = await req.json();
  if (!body.title) return badRequest("title is required");

  const { data, error } = await supabase
    .from("clips")
    .insert({
      title: body.title,
      url: body.url || null,
      source: body.source || null,
      type: body.type || "bookmark",
      content: body.content || null,
      excerpt: body.excerpt || null,
      author: body.author || null,
      favicon_url: body.favicon_url || null,
      thumbnail_url: body.thumbnail_url || null,
      archive_path: body.archive_path || null,
      price: body.price || null,
      metadata: body.metadata || {},
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data, { status: 201 });
}
