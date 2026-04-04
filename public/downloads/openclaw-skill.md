# Zikit - Website Change Monitor

## Description
Connect to Zikit (zikit.ai) to monitor websites for changes and get AI-powered summaries. List monitors, check recent changes, trigger manual checks, and ask AI questions about detected changes.

## Configuration
Before using this skill, the user must provide their Zikit API key. Ask for it if not set.

- **API Key**: Stored as `ZIKIT_API_KEY` in your environment or config
- **Base URL**: `https://zikit.ai`

## Authentication
All requests use Bearer token authentication:
```
Authorization: Bearer <ZIKIT_API_KEY>
```

## Available Actions

### 1. List all monitors
Show what pages are being tracked.

```bash
curl -s -H "Authorization: Bearer $ZIKIT_API_KEY" \
  "https://zikit.ai/api/v1/monitors" | jq '.monitors[] | {name, url, healthStatus, checkFrequency, lastCheckedAt}'
```

**Response fields:**
- `name` - Monitor display name
- `url` - The URL being watched
- `healthStatus` - "healthy", "unstable", or "error"
- `checkFrequency` - "15min", "hourly", "every_6h", "daily", "weekly"
- `lastCheckedAt` - When it was last checked
- `isPaused` - Whether monitoring is paused
- `totalChanges` - Number of changes detected
- `totalChecks` - Number of checks performed

### 2. Get monitor details + recent changes
Get a specific monitor with its detected changes.

```bash
curl -s -H "Authorization: Bearer $ZIKIT_API_KEY" \
  "https://zikit.ai/api/v1/monitors/<MONITOR_ID>"
```

**Response includes:**
- `monitor` - Full monitor details
- `changes` - Array of detected changes, each with:
  - `summary` - AI-generated plain-English summary of what changed
  - `importanceScore` - 1-10 (10 = critical)
  - `changeType` - "content", "price", "removal", "addition", "structure"
  - `actionItem` - Suggested action if any
  - `createdAt` - When the change was detected

### 3. Get changes for a monitor (JSON)
List detected changes with full details. Use `?limit=N` (max 100, default 20).

```bash
curl -s -H "Authorization: Bearer $ZIKIT_API_KEY" \
  "https://zikit.ai/api/v1/monitors/<MONITOR_ID>/changes?limit=10"
```

**Response:** `{ "changes": [...], "count": N }`
Each change includes: `id`, `summary`, `changeType`, `importanceScore`, `details`, `actionItem`, `addedText`, `removedText`, `keywordMatched`, `createdAt`.

### 4. Trigger a manual check
Force an immediate check on a monitor.

```bash
curl -s -X POST -H "Authorization: Bearer $ZIKIT_API_KEY" \
  "https://zikit.ai/api/v1/monitors/<MONITOR_ID>/check"
```

Returns the check result with any new changes found.

### 4. Create a new monitor
Start monitoring a new URL.

```bash
curl -s -X POST -H "Authorization: Bearer $ZIKIT_API_KEY" \
  -H "Content-Type: application/json" \
  "https://zikit.ai/api/v1/monitors" \
  -d '{"url": "https://example.com", "name": "Example", "checkFrequency": "daily"}'
```

**Required fields:**
- `url` - The URL to monitor
- `name` - Display name

**Optional fields:**
- `checkFrequency` - "daily" (default), "hourly", "every_6h", "weekly", "15min"
- `cssSelector` - CSS selector to monitor specific element (string, e.g. "#pricing-table, .main-content")
- `ignoreSelectors` - CSS selectors to exclude (string, comma-separated, e.g. ".ads, .timestamp")
- `useCase` - "competitor", "regulatory", "ecommerce", "jobs", "content", "custom"
- `watchKeywords` - Comma-separated keywords to watch for (string, e.g. "price, sale, discount")
- `keywordMode` - "any" (default, alert on any keyword change), "appear" (keyword added), "disappear" (keyword removed)
- `description` - Notes about why you're tracking this page (string)
- `tags` - Comma-separated tags to organize monitors (string, e.g. "competitor, pricing")

### 5. Pause/Resume a monitor

```bash
# Pause
curl -s -X PATCH -H "Authorization: Bearer $ZIKIT_API_KEY" \
  -H "Content-Type: application/json" \
  "https://zikit.ai/api/v1/monitors/<MONITOR_ID>" \
  -d '{"isPaused": true}'

# Resume
curl -s -X PATCH -H "Authorization: Bearer $ZIKIT_API_KEY" \
  -H "Content-Type: application/json" \
  "https://zikit.ai/api/v1/monitors/<MONITOR_ID>" \
  -d '{"isPaused": false}'
```

### 6. Edit monitor settings
Update keywords, CSS selectors, frequency, or any other setting.

```bash
curl -s -X PATCH -H "Authorization: Bearer $ZIKIT_API_KEY" \
  -H "Content-Type: application/json" \
  "https://zikit.ai/api/v1/monitors/<MONITOR_ID>" \
  -d '{"watchKeywords": "price, sale", "checkFrequency": "hourly", "useCase": "competitor"}'
```

Any field from the create endpoint can be updated: `name`, `checkFrequency`, `cssSelector`, `ignoreSelectors`, `watchKeywords`, `keywordMode`, `useCase`, `description`, `tags`.

### 7. Manage alert preferences
Get and set notification channels and importance thresholds per monitor.

```bash
# Get current alert configs for a monitor
curl -s -H "Authorization: Bearer $ZIKIT_API_KEY" \
  "https://zikit.ai/api/v1/alert-configs?monitorId=<MONITOR_ID>"

# Set/update an alert config
curl -s -X POST -H "Authorization: Bearer $ZIKIT_API_KEY" \
  -H "Content-Type: application/json" \
  "https://zikit.ai/api/v1/alert-configs" \
  -d '{"monitorId": "<MONITOR_ID>", "channel": "email", "destination": "user@example.com", "minImportance": 3, "isActive": true}'
```

**Channels:** "email", "slack", "discord", "telegram", "webhook"
**minImportance:** 1 (everything) to 10 (critical only). Recommended: 3 for Notable+.
**Note:** Keyword matches always trigger alerts regardless of minImportance.

### 8. Delete a monitor

```bash
curl -s -X DELETE -H "Authorization: Bearer $ZIKIT_API_KEY" \
  "https://zikit.ai/api/v1/monitors/<MONITOR_ID>"
```

### 9. Export changes as CSV

```bash
# All changes across all monitors
curl -s -H "Authorization: Bearer $ZIKIT_API_KEY" \
  "https://zikit.ai/api/v1/changes/export" -o changes.csv

# Changes for a specific monitor
curl -s -H "Authorization: Bearer $ZIKIT_API_KEY" \
  "https://zikit.ai/api/v1/monitors/<MONITOR_ID>/export" -o monitor-changes.csv
```

### 10. Get unread changes count
Quick check if there are new changes since last time.

```bash
curl -s -H "Authorization: Bearer $ZIKIT_API_KEY" \
  "https://zikit.ai/api/v1/extension/badge-count?since=<ISO_TIMESTAMP>"
```

## How to respond to the user

When the user asks about their monitors or website changes:

1. **"What changed?"** or **"Any updates?"** - Call list monitors, then get details for monitors with recent changes. Summarize the most important changes.

2. **"What changed on [site name]?"** - Find the monitor by name, get its changes, summarize the latest ones.

3. **"Monitor [URL]"** or **"Watch [URL]"** - Create a new monitor for that URL.

4. **"Check [site] now"** - Find the monitor and trigger a manual check. Report what was found.

5. **"Pause/Stop [site]"** - Find and pause the monitor.

6. **"How many monitors do I have?"** - List monitors and count them.

7. **"Show me important changes"** - List monitors, get changes, filter by importanceScore >= 6.

## Proactive alerts (cron)

To proactively notify the user about new changes, set up a periodic check:

Every 30 minutes, call the badge-count endpoint with the last check timestamp. If `unreadChanges > 0`, fetch the actual changes and notify the user with a summary.

## Rate limits
- 30 requests per minute per API key
- Monthly check quota depends on plan (Business: 10,000 checks/month)

## Example conversation

**User:** What changed today?
**Agent:** *calls GET /api/v1/monitors, finds 4 monitors, gets changes for each*
**Agent:** "3 changes detected today:
- **ynet** (news): Headlines updated with new coverage about economic policy changes (importance: 4/10)
- **Mako** (legal): Terms of service section was restructured, no major policy changes (importance: 3/10)  
- **competitor.com** (pricing): Pro plan price dropped from $49 to $39! (importance: 8/10 - action recommended)"

**User:** Monitor https://example.com/pricing
**Agent:** *calls POST /api/v1/monitors*
**Agent:** "Done! I'm now watching example.com/pricing. I'll check it daily and let you know when something changes."
