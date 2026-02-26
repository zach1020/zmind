// ZMind Popup Script

const clipBtn = document.getElementById("clipBtn");
const statusEl = document.getElementById("status");
const pageTitleEl = document.getElementById("pageTitle");
const tagsContainer = document.getElementById("tagsContainer");
const settingsToggle = document.getElementById("settingsToggle");
const settingsPanel = document.getElementById("settingsPanel");
const apiUrlInput = document.getElementById("apiUrl");
const apiKeyInput = document.getElementById("apiKey");

let currentTabUrl = "";

// Load current tab info
chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
  pageTitleEl.textContent = tab.title || tab.url;
  currentTabUrl = tab.url;
});

// Load settings
chrome.storage.local.get(["apiUrl", "apiKey"], (data) => {
  apiUrlInput.value = data.apiUrl || "http://localhost:3000";
  apiKeyInput.value = data.apiKey || "";
});

// Save settings on change
apiUrlInput.addEventListener("change", () => {
  chrome.storage.local.set({ apiUrl: apiUrlInput.value });
});
apiKeyInput.addEventListener("change", () => {
  chrome.storage.local.set({ apiKey: apiKeyInput.value });
});

// Toggle settings
settingsToggle.addEventListener("click", () => {
  settingsPanel.classList.toggle("visible");
});

// Clip button — sends the URL to the service worker, which calls the API
clipBtn.addEventListener("click", async () => {
  if (!currentTabUrl) return;

  clipBtn.disabled = true;
  statusEl.className = "status loading";
  statusEl.textContent = "Clipping page...";
  tagsContainer.innerHTML = "";

  try {
    const result = await chrome.runtime.sendMessage({
      action: "clip_page",
      url: currentTabUrl,
    });

    if (result && result.success) {
      statusEl.className = "status success";
      statusEl.textContent = `Clipped "${result.clip.title}"`;

      if (result.tags && result.tags.length > 0) {
        result.tags.forEach((tag) => {
          const el = document.createElement("span");
          el.className = "tag";
          el.textContent = tag.name;
          tagsContainer.appendChild(el);
        });
      }
    } else {
      throw new Error(result?.error || "Unknown error");
    }
  } catch (err) {
    statusEl.className = "status error";
    statusEl.textContent = `Error: ${err.message}`;
  } finally {
    clipBtn.disabled = false;
  }
});
