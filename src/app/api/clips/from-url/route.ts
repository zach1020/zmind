import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { generateTags } from "@/lib/claude";
import { checkApiKey, unauthorized, badRequest, extractDomain } from "@/lib/utils";

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  if (!checkApiKey(req)) return unauthorized();

  const body = await req.json();
  if (!body.url) return badRequest("url is required");

  const url: string = body.url.trim();

  // Fetch the page and extract metadata
  let title = url;
  let description: string | null = null;
  let ogImage: string | null = null;
  let ogType: string | null = null;
  let author: string | null = null;
  let favicon: string | null = null;
  const domain = extractDomain(url);

  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "ZMind/1.0" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();

    // Extract title
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    if (titleMatch) title = titleMatch[1].trim();

    // Extract meta tags
    const getMeta = (pattern: RegExp) => {
      const m = html.match(pattern);
      return m ? m[1].trim() : null;
    };

    const ogTitle = getMeta(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i)
      || getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i);
    if (ogTitle) title = ogTitle;

    description = getMeta(/<meta[^>]+property=["']og:description["'][^>]+content=["']([^"']+)["']/i)
      || getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:description["']/i)
      || getMeta(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/i)
      || getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description["']/i);

    ogImage = getMeta(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
      || getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);

    ogType = getMeta(/<meta[^>]+property=["']og:type["'][^>]+content=["']([^"']+)["']/i)
      || getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:type["']/i);

    author = getMeta(/<meta[^>]+name=["']author["'][^>]+content=["']([^"']+)["']/i)
      || getMeta(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']author["']/i);

    const faviconMatch = html.match(/<link[^>]+rel=["'](?:shortcut )?icon["'][^>]+href=["']([^"']+)["']/i);
    if (faviconMatch) {
      favicon = faviconMatch[1];
      if (favicon.startsWith("/")) {
        const base = new URL(url);
        favicon = `${base.origin}${favicon}`;
      }
    }
  } catch {
    // If fetch fails, we still create the clip with the URL as title
  }

  // Determine clip type
  const clipType = detectType(domain, ogType);

  // Create clip
  const { data: clip, error } = await supabase
    .from("clips")
    .insert({
      title,
      url,
      source: domain,
      type: clipType,
      excerpt: description,
      author,
      favicon_url: favicon,
      thumbnail_url: ogImage,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Auto-tag with Claude
  let tags: { id: string; name: string }[] = [];
  try {
    const tagNames = await generateTags(title, url, description);
    for (const name of tagNames) {
      const { data: tag } = await supabase
        .from("tags")
        .upsert({ name: name.toLowerCase() }, { onConflict: "name" })
        .select()
        .single();
      if (tag) {
        await supabase
          .from("clip_tags")
          .upsert({ clip_id: clip.id, tag_id: tag.id });
        tags.push(tag);
      }
    }
  } catch {
    // Auto-tagging is non-critical
  }

  return NextResponse.json({ clip, tags }, { status: 201 });
}

function detectType(domain: string, ogType: string | null): string {
  const d = domain.toLowerCase();
  const t = (ogType || "").toLowerCase();

  if (d.includes("youtube") || d.includes("vimeo") || d.includes("twitch") || t === "video" || t === "video.other")
    return "video";
  if (d.includes("spotify") || d.includes("soundcloud") || d.includes("bandcamp"))
    return "music";
  if (d.includes("unsplash") || d.includes("flickr") || d.includes("artstation"))
    return "image";
  if (d.includes("github") || d.includes("gitlab"))
    return "tool";
  if (t === "article" || d.includes("medium") || d.includes("substack"))
    return "article";

  return "website";
}
