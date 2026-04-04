/**
 * Content script — runs ONLY on zikit.ai/auth/extension.
 * Reads auto-generated API key from the page DOM and sends to background.
 * SECURITY: Only matches zikit.ai/auth/extension*, validates key format strictly.
 */

export default defineContentScript({
  matches: ["https://zikit.ai/auth/extension*", "https://www.zikit.ai/auth/extension*"],
  runAt: "document_idle",
  main() {
    function tryReadKey() {
      const el = document.getElementById("zikit-ext-auth");
      if (!el) return false;

      const key = el.dataset.key;

      // SECURITY: Strict format validation
      if (!key || !/^zk_live_[a-f0-9]{32,64}$/.test(key)) return false;

      // Mark as picked so fallback doesn't show
      el.dataset.picked = "true";

      // Send to background (background validates sender.url)
      chrome.runtime.sendMessage({ type: "auto-auth-key", key });
      return true;
    }

    // Try immediately, then retry a few times (page might still be rendering)
    if (!tryReadKey()) {
      let attempts = 0;
      const interval = setInterval(() => {
        attempts++;
        if (tryReadKey() || attempts > 20) {
          clearInterval(interval);
        }
      }, 250);
    }
  },
});
