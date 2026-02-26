// ZMind Service Worker
// Clips pages by sending the URL to the ZMind API (server handles metadata + tagging)

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "clip_page") {
    handleClipPage(message.url).then(sendResponse);
    return true; // keep channel open for async
  }
});

async function handleClipPage(url) {
  try {
    const settings = await chrome.storage.local.get(["apiUrl", "apiKey"]);
    const apiUrl = settings.apiUrl || "http://localhost:3000";
    const apiKey = settings.apiKey || "";

    // Use the from-url endpoint — server fetches metadata + auto-tags
    const res = await fetch(`${apiUrl}/api/clips/from-url`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
      },
      body: JSON.stringify({ url }),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Failed to clip");
    }

    const data = await res.json();
    return { success: true, clip: data.clip, tags: data.tags || [] };
  } catch (error) {
    console.error("ZMind clip error:", error);
    return { success: false, error: error.message };
  }
}
