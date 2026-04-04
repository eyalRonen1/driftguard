import { defineConfig } from "wxt";

export default defineConfig({
  srcDir: "src",
  modules: ["@wxt-dev/module-react"],
  manifest: {
    name: "Zikit - Website Change Monitor",
    description: "Monitor any website for changes with AI-powered summaries. One click to start tracking.",
    version: "1.0.1",
    permissions: ["storage", "activeTab", "contextMenus", "alarms"],
    host_permissions: ["https://zikit.ai/*"],
    commands: {
      "quick-add": {
        suggested_key: { default: "Alt+M", mac: "Alt+M" },
        description: "Monitor this page",
      },
    },
    icons: {
      "16": "icon/16.png",
      "32": "icon/32.png",
      "48": "icon/48.png",
      "128": "icon/128.png",
    },
    content_security_policy: {
      extension_pages: "script-src 'self'; object-src 'self'; connect-src https://zikit.ai https://*.zikit.ai",
    },
  },
});
