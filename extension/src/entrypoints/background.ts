import { BADGE_CHECK_INTERVAL_MIN, API_BASE } from "@/lib/constants";

export default defineBackground(() => {
  // === Context Menu ===
  chrome.contextMenus.create({
    id: "monitor-page",
    title: "Monitor this page with Zikit",
    contexts: ["page"],
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "monitor-page" && tab?.id) {
      chrome.storage.local.set({
        zikit_pending_url: tab.url,
        zikit_pending_title: tab.title,
      });
      chrome.action.openPopup();
    }
  });

  // === Badge Notifications ===
  chrome.alarms.create("badge-check", { periodInMinutes: BADGE_CHECK_INTERVAL_MIN });

  chrome.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name !== "badge-check") return;

    try {
      const result = await chrome.storage.local.get(["zikit_auth", "zikit_last_seen"]);
      const auth = result.zikit_auth;
      if (!auth?.apiKey) return;

      const lastSeen = result.zikit_last_seen || new Date(Date.now() - 60 * 60 * 1000).toISOString();
      const res = await fetch(`${API_BASE}/api/v1/extension/badge-count?since=${encodeURIComponent(lastSeen)}`, {
        headers: { Authorization: `Bearer ${auth.apiKey}` },
      });

      if (!res.ok) return;
      const data = await res.json();
      const count = data.unreadChanges || 0;

      if (count > 0) {
        chrome.action.setBadgeText({ text: String(count) });
        chrome.action.setBadgeBackgroundColor({ color: "#E3BE69" });
      } else {
        chrome.action.setBadgeText({ text: "" });
      }
    } catch {
      // Silently fail - will retry on next alarm
    }
  });

  // === Auto-Auth from zikit.ai/auth/extension ===
  chrome.runtime.onMessage.addListener(async (msg, sender) => {
    // SECURITY: Only accept auth messages from zikit.ai auth page
    const senderUrl = sender.url || "";
    if (!senderUrl.startsWith("https://zikit.ai/auth/extension") &&
        !senderUrl.startsWith("https://www.zikit.ai/auth/extension")) {
      return;
    }

    // SECURITY: Only accept messages from our own content scripts
    if (sender.id !== chrome.runtime.id) return;

    if (msg.type === "auto-auth-key" && msg.key?.startsWith("zk_live_")) {
      // Validate key format strictly
      if (!/^zk_live_[a-f0-9]{32,64}$/.test(msg.key)) return;

      try {
        const res = await fetch(`${API_BASE}/api/v1/extension/verify`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${msg.key}`,
          },
        });
        const data = await res.json();
        if (data.valid) {
          await chrome.storage.local.set({
            zikit_auth: {
              apiKey: msg.key,
              org: data.org,
              user: data.user,
              limits: data.limits,
            },
          });
          // Close the auth tab
          if (sender.tab?.id) {
            chrome.tabs.remove(sender.tab.id);
          }
        }
      } catch {
        // Silent fail
      }
    }
  });

  // === Keyboard Shortcut ===
  chrome.commands.onCommand.addListener((command) => {
    if (command === "quick-add") {
      chrome.action.openPopup();
    }
  });
});
