// Determines clip type from page metadata

function determineClipType(metadata, url) {
  const domain = (metadata.domain || "").toLowerCase();
  const ogType = (metadata.ogType || "").toLowerCase();

  // Video sites
  if (
    domain.includes("youtube") ||
    domain.includes("vimeo") ||
    domain.includes("twitch") ||
    ogType === "video"
  ) {
    return "video";
  }

  // Music sites
  if (
    domain.includes("spotify") ||
    domain.includes("soundcloud") ||
    domain.includes("bandcamp") ||
    ogType === "music"
  ) {
    return "music";
  }

  // Image sites
  if (
    domain.includes("unsplash") ||
    domain.includes("flickr") ||
    domain.includes("artstation") ||
    domain.includes("deviantart")
  ) {
    return "image";
  }

  // GitHub
  if (domain.includes("github")) {
    return "tool";
  }

  // Article indicators
  if (ogType === "article" || domain.includes("medium") || domain.includes("substack")) {
    return "article";
  }

  // Default
  return "website";
}
