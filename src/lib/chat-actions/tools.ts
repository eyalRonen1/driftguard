export const CHAT_TOOLS = [
  {
    type: "function" as const,
    function: {
      name: "list_monitors",
      description: "List all monitors the user has. Use when they ask to see their monitors, pages, or what they're tracking.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_stats",
      description: "Get account statistics: monitor count, change count, plan, usage. Use when user asks about their account, plan, or usage.",
      parameters: { type: "object", properties: {}, required: [] },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "create_monitor",
      description: "Create a new monitor to watch a URL. Use when the user wants to add/watch/monitor a new page.",
      parameters: {
        type: "object",
        properties: {
          url: { type: "string", description: "The URL to monitor" },
          name: { type: "string", description: "Optional name for the monitor" },
          checkFrequency: { type: "string", enum: ["15min", "hourly", "every_6h", "daily", "weekly"], description: "How often to check. Default: daily" },
        },
        required: ["url"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "check_monitor",
      description: "Trigger an immediate check on a monitor. Use when user asks to check a specific page now.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name or URL of the monitor to check" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "pause_monitor",
      description: "Pause a monitor so it stops checking. Use when user wants to stop/pause monitoring a page.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name or URL of the monitor to pause" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "resume_monitor",
      description: "Resume a paused monitor. Use when user wants to start/resume/unpause monitoring.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name or URL of the monitor to resume" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "delete_monitor",
      description: "Delete a monitor and all its history. DESTRUCTIVE - requires confirmation. Use only when user explicitly asks to delete/remove a monitor.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name or URL of the monitor to delete" },
        },
        required: ["name"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_changes",
      description: "Get recent changes detected on a specific monitor. Use when user asks what changed on a specific page.",
      parameters: {
        type: "object",
        properties: {
          name: { type: "string", description: "The name or URL of the monitor" },
        },
        required: ["name"],
      },
    },
  },
];
