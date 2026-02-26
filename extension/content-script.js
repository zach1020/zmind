// ZMind Content Script
// Captures page DOM and metadata when requested by service worker

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "capture") {
    const metadata = extractMetadata();
    const html = document.documentElement.outerHTML;
    const resourceUrls = extractResourceUrls();

    sendResponse({
      html,
      metadata,
      resourceUrls,
      url: window.location.href,
    });
  }
  return true; // keep channel open for async
});

function extractMetadata() {
  const getMeta = (name) => {
    const el =
      document.querySelector(`meta[property="${name}"]`) ||
      document.querySelector(`meta[name="${name}"]`);
    return el ? el.getAttribute("content") : null;
  };

  const faviconEl =
    document.querySelector('link[rel="icon"]') ||
    document.querySelector('link[rel="shortcut icon"]');

  return {
    title: document.title,
    description: getMeta("description") || getMeta("og:description"),
    ogTitle: getMeta("og:title"),
    ogImage: getMeta("og:image"),
    ogType: getMeta("og:type"),
    ogSiteName: getMeta("og:site_name"),
    author:
      getMeta("author") ||
      getMeta("article:author") ||
      getMeta("twitter:creator"),
    favicon: faviconEl ? faviconEl.href : null,
    url: window.location.href,
    domain: window.location.hostname.replace("www.", ""),
  };
}

function extractResourceUrls() {
  const urls = new Set();

  // Stylesheets
  document.querySelectorAll('link[rel="stylesheet"]').forEach((el) => {
    if (el.href) urls.add(el.href);
  });

  // Images
  document.querySelectorAll("img[src]").forEach((el) => {
    if (el.src) urls.add(el.src);
  });

  return Array.from(urls).slice(0, 50); // cap to avoid huge payloads
}
