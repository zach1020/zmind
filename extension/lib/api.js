// ZMind API client for the extension

async function createClip(apiUrl, apiKey, clipData) {
  const res = await fetch(`${apiUrl}/api/clips`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify(clipData),
  });

  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || "Failed to create clip");
  }

  return res.json();
}

async function uploadArchive(apiUrl, apiKey, clipId, html) {
  const blob = new Blob([html], { type: "text/html" });
  const formData = new FormData();
  formData.append("file", blob, "archive.html");
  formData.append("clip_id", clipId);

  const res = await fetch(`${apiUrl}/api/clips/archive`, {
    method: "POST",
    headers: { "x-api-key": apiKey },
    body: formData,
  });

  if (!res.ok) {
    throw new Error("Failed to upload archive");
  }

  return res.json();
}

async function uploadThumbnail(apiUrl, apiKey, clipId, dataUrl) {
  const res = await fetch(`${apiUrl}/api/clips/${clipId}/thumbnail`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
    },
    body: JSON.stringify({ image: dataUrl }),
  });

  if (!res.ok) {
    throw new Error("Failed to upload thumbnail");
  }

  return res.json();
}

async function autoTag(apiUrl, apiKey, clipId) {
  try {
    const res = await fetch(`${apiUrl}/api/autotag`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ clip_id: clipId }),
    });

    if (res.ok) {
      const data = await res.json();
      return data.tags || [];
    }
  } catch {
    // Auto-tagging is non-critical
  }
  return [];
}
