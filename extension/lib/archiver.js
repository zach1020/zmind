// Inlines external resources as data URIs to create self-contained HTML

async function archivePage(html, resourceUrls) {
  let archivedHtml = html;

  // Fetch and inline CSS and images as base64
  for (const url of resourceUrls) {
    try {
      const response = await fetch(url);
      if (!response.ok) continue;

      const contentType = response.headers.get("content-type") || "text/plain";
      const blob = await response.blob();
      const base64 = await blobToBase64(blob);
      const dataUri = `data:${contentType};base64,${base64}`;

      // Replace all occurrences of this URL
      archivedHtml = archivedHtml.split(url).join(dataUri);
    } catch {
      // Skip resources that fail to fetch
    }
  }

  return archivedHtml;
}

function blobToBase64(blob) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      resolve(result.split(",")[1]);
    };
    reader.readAsDataURL(blob);
  });
}
