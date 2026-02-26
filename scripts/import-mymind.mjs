import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Map mymind types to ZMind types
const TYPE_MAP = {
  Article: "article",
  WebPage: "website",
  YouTubeVideo: "video",
  Embed: "video",
  Product: "price",
  Repository: "tool",
  WikipediaArticle: "article",
  RedditPost: "bookmark",
  Note: "note",
  MusicRecording: "music",
  Issue: "bookmark",
  Image: "image",
  Document: "article",
  Placeholder: "bookmark",
};

function extractDomain(url) {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace("www.", "");
  } catch {
    return null;
  }
}

async function main() {
  const csvPath = process.argv[2];
  if (!csvPath) {
    console.error("Usage: node scripts/import-mymind.mjs <path-to-cards.csv>");
    process.exit(1);
  }
  const raw = readFileSync(csvPath, "utf-8");
  const records = parse(raw, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true,
    relax_quotes: true,
  });

  console.log(`Parsed ${records.length} records from CSV`);

  // Collect all unique tags first
  const allTagNames = new Set();
  for (const row of records) {
    if (row.tags) {
      row.tags.split(",").map((t) => t.trim()).filter(Boolean).forEach((t) => allTagNames.add(t));
    }
  }
  console.log(`Found ${allTagNames.size} unique tags`);

  // Upsert all tags
  const tagRows = [...allTagNames].map((name) => ({ name }));
  // Insert in batches of 50
  for (let i = 0; i < tagRows.length; i += 50) {
    const batch = tagRows.slice(i, i + 50);
    const { error } = await supabase.from("tags").upsert(batch, {
      onConflict: "name",
      ignoreDuplicates: true,
    });
    if (error) console.error("Tag upsert error:", error.message);
  }

  // Fetch all tags back to get IDs
  const { data: dbTags } = await supabase.from("tags").select("id, name");
  const tagMap = new Map(dbTags.map((t) => [t.name, t.id]));
  console.log(`${tagMap.size} tags in database`);

  // Import clips in batches
  let imported = 0;
  let skipped = 0;

  for (const row of records) {
    const type = TYPE_MAP[row.type] || "bookmark";
    const title = row.title || (row.url ? extractDomain(row.url) : "Untitled Note");
    const url = row.url || null;
    const content = row.content || null;
    const note = row.note || null;
    const createdAt = row.created ? new Date(row.created).toISOString() : new Date().toISOString();

    // Skip rows with no meaningful data
    if (!title && !url && !content && !note) {
      skipped++;
      continue;
    }

    const clipData = {
      title: title || "Untitled",
      url,
      source: extractDomain(url),
      type,
      content: content || note || null,
      excerpt: note || (content ? content.substring(0, 200) : null),
      metadata: { imported_from: "mymind", original_id: row.id, original_type: row.type },
      created_at: createdAt,
    };

    const { data: clip, error } = await supabase
      .from("clips")
      .insert(clipData)
      .select("id")
      .single();

    if (error) {
      console.error(`Failed to import "${title}": ${error.message}`);
      skipped++;
      continue;
    }

    // Link tags
    if (row.tags) {
      const tagNames = row.tags.split(",").map((t) => t.trim()).filter(Boolean);
      const clipTags = tagNames
        .map((name) => {
          const tagId = tagMap.get(name);
          if (!tagId) return null;
          return { clip_id: clip.id, tag_id: tagId };
        })
        .filter(Boolean);

      if (clipTags.length > 0) {
        const { error: linkError } = await supabase.from("clip_tags").insert(clipTags);
        if (linkError) console.error(`Tag link error for "${title}": ${linkError.message}`);
      }
    }

    imported++;
    if (imported % 25 === 0) console.log(`  imported ${imported}...`);
  }

  console.log(`\nDone! Imported ${imported} clips, skipped ${skipped}`);
}

main().catch(console.error);
