import {
  pgTable,
  uuid,
  varchar,
  text,
  boolean,
  integer,
  decimal,
  timestamp,
  jsonb,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ==========================================
// USERS (kept from DriftGuard)
// ==========================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  name: varchar("name", { length: 255 }),
  avatarUrl: text("avatar_url"),
  supabaseAuthId: uuid("supabase_auth_id").unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// ==========================================
// ORGANIZATIONS (kept from DriftGuard)
// ==========================================

export const organizations = pgTable(
  "organizations",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 255 }).notNull(),
    slug: varchar("slug", { length: 100 }).notNull().unique(),
    ownerId: uuid("owner_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    plan: varchar("plan", { length: 20 }).notNull().default("free"),
    paddleCustomerId: varchar("paddle_customer_id", { length: 255 }),
    paddleSubscriptionId: varchar("paddle_subscription_id", { length: 255 }),
    paddleSubscriptionStatus: varchar("paddle_subscription_status", { length: 50 }).default("none"),
    monthlyCheckQuota: integer("monthly_check_quota").notNull().default(100),
    monthlyChecksUsed: integer("monthly_checks_used").notNull().default(0),
    quotaResetAt: timestamp("quota_reset_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_organizations_owner").on(table.ownerId),
  ]
);

// ==========================================
// MONITORS - URLs being tracked
// ==========================================

export const monitors = pgTable(
  "monitors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    url: text("url").notNull(),

    // Check configuration
    checkFrequency: varchar("check_frequency", { length: 20 }).notNull().default("daily"),
    cssSelector: text("css_selector"), // Optional: monitor only a specific part of the page
    ignoreSelectors: text("ignore_selectors"), // CSS selectors to ignore (ads, timestamps, etc.)
    headers: jsonb("headers").default({}), // Custom request headers

    // Content tracking
    lastContentHash: varchar("last_content_hash", { length: 64 }),
    lastContentText: text("last_content_text"),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    nextCheckAt: timestamp("next_check_at", { withTimezone: true }),

    // Status
    isActive: boolean("is_active").notNull().default(true),
    isPaused: boolean("is_paused").notNull().default(false),
    consecutiveErrors: integer("consecutive_errors").notNull().default(0),
    lastError: text("last_error"),

    // Health (separate from content changes)
    healthStatus: varchar("health_status", { length: 20 }).notNull().default("healthy"), // healthy, unstable, blocked, error
    healthReason: text("health_reason"),
    healthCheckedAt: timestamp("health_checked_at", { withTimezone: true }),
    lastHealthyAt: timestamp("last_healthy_at", { withTimezone: true }),

    // Use case metadata
    useCase: varchar("use_case", { length: 30 }), // competitor, regulatory, ecommerce, jobs, content, custom

    // Metadata
    description: text("description"),
    tags: text("tags"), // comma-separated

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_monitors_org").on(table.orgId),
    index("idx_monitors_next_check").on(table.nextCheckAt),
    index("idx_monitors_active_schedule").on(table.isActive, table.isPaused, table.nextCheckAt),
  ]
);

// ==========================================
// SNAPSHOTS - Content captures at a point in time
// ==========================================

export const snapshots = pgTable(
  "snapshots",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    monitorId: uuid("monitor_id").notNull().references(() => monitors.id, { onDelete: "cascade" }),
    contentText: text("content_text").notNull(),
    contentHash: varchar("content_hash", { length: 64 }).notNull(),
    contentLength: integer("content_length").notNull().default(0),
    statusCode: integer("status_code"),
    responseTimeMs: integer("response_time_ms"),
    capturedAt: timestamp("captured_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_snapshots_monitor").on(table.monitorId),
    index("idx_snapshots_monitor_captured").on(table.monitorId, table.capturedAt),
  ]
);

// ==========================================
// CHANGES - Detected changes with AI summaries
// ==========================================

export const changes = pgTable(
  "changes",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    monitorId: uuid("monitor_id").notNull().references(() => monitors.id, { onDelete: "cascade" }),
    orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    snapshotBeforeId: uuid("snapshot_before_id").references(() => snapshots.id, { onDelete: "set null" }),
    snapshotAfterId: uuid("snapshot_after_id").references(() => snapshots.id, { onDelete: "set null" }),

    // AI-generated summary
    summary: text("summary").notNull(), // "Competitor dropped price from $49 to $39"
    summaryModel: varchar("summary_model", { length: 50 }),

    // Classification
    changeType: varchar("change_type", { length: 30 }).notNull().default("content"), // content, price, removal, addition, structure
    importanceScore: integer("importance_score").notNull().default(5), // 1-10, AI-assigned

    // Raw diff data
    addedText: text("added_text"),
    removedText: text("removed_text"),
    diffPercentage: decimal("diff_percentage", { precision: 5, scale: 2 }), // how much changed (0-100%)

    // Notification tracking
    notified: boolean("notified").notNull().default(false),
    notifiedAt: timestamp("notified_at", { withTimezone: true }),

    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_changes_monitor").on(table.monitorId),
    index("idx_changes_org").on(table.orgId),
    index("idx_changes_org_created").on(table.orgId, table.createdAt),
  ]
);

// ==========================================
// ALERT CONFIGS
// ==========================================

export const alertConfigs = pgTable(
  "alert_configs",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    monitorId: uuid("monitor_id").references(() => monitors.id, { onDelete: "cascade" }),
    orgId: uuid("org_id").notNull().references(() => organizations.id, { onDelete: "cascade" }),
    channel: varchar("channel", { length: 20 }).notNull(), // email, slack
    destination: text("destination").notNull(), // email address or webhook URL
    minImportance: integer("min_importance").notNull().default(3), // only alert on changes >= this score
    isActive: boolean("is_active").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("idx_alert_configs_org").on(table.orgId),
    index("idx_alert_configs_monitor").on(table.monitorId),
  ]
);

// ==========================================
// RELATIONS
// ==========================================

export const usersRelations = relations(users, ({ many }) => ({
  organizations: many(organizations),
}));

export const organizationsRelations = relations(organizations, ({ one, many }) => ({
  owner: one(users, { fields: [organizations.ownerId], references: [users.id] }),
  monitors: many(monitors),
  changes: many(changes),
}));

export const monitorsRelations = relations(monitors, ({ one, many }) => ({
  organization: one(organizations, { fields: [monitors.orgId], references: [organizations.id] }),
  snapshots: many(snapshots),
  changes: many(changes),
  alertConfigs: many(alertConfigs),
}));

export const snapshotsRelations = relations(snapshots, ({ one }) => ({
  monitor: one(monitors, { fields: [snapshots.monitorId], references: [monitors.id] }),
}));

export const changesRelations = relations(changes, ({ one }) => ({
  monitor: one(monitors, { fields: [changes.monitorId], references: [monitors.id] }),
  organization: one(organizations, { fields: [changes.orgId], references: [organizations.id] }),
  snapshotBefore: one(snapshots, { fields: [changes.snapshotBeforeId], references: [snapshots.id] }),
  snapshotAfter: one(snapshots, { fields: [changes.snapshotAfterId], references: [snapshots.id] }),
}));
