CREATE TABLE "alert_configs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monitor_id" uuid,
	"org_id" uuid NOT NULL,
	"channel" varchar(20) NOT NULL,
	"destination" text NOT NULL,
	"min_importance" integer DEFAULT 3 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "changes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monitor_id" uuid NOT NULL,
	"org_id" uuid NOT NULL,
	"snapshot_before_id" uuid,
	"snapshot_after_id" uuid,
	"summary" text NOT NULL,
	"summary_model" varchar(50),
	"change_type" varchar(30) DEFAULT 'content' NOT NULL,
	"importance_score" integer DEFAULT 5 NOT NULL,
	"added_text" text,
	"removed_text" text,
	"diff_percentage" numeric(5, 2),
	"notified" boolean DEFAULT false NOT NULL,
	"notified_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "monitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"org_id" uuid NOT NULL,
	"name" varchar(255) NOT NULL,
	"url" text NOT NULL,
	"check_frequency" varchar(20) DEFAULT 'daily' NOT NULL,
	"css_selector" text,
	"ignore_selectors" text,
	"headers" jsonb DEFAULT '{}'::jsonb,
	"last_content_hash" varchar(64),
	"last_content_text" text,
	"last_checked_at" timestamp with time zone,
	"next_check_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_paused" boolean DEFAULT false NOT NULL,
	"consecutive_errors" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"description" text,
	"tags" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organizations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"owner_id" uuid NOT NULL,
	"plan" varchar(20) DEFAULT 'free' NOT NULL,
	"paddle_customer_id" varchar(255),
	"paddle_subscription_id" varchar(255),
	"paddle_subscription_status" varchar(50) DEFAULT 'none',
	"monthly_check_quota" integer DEFAULT 100 NOT NULL,
	"monthly_checks_used" integer DEFAULT 0 NOT NULL,
	"quota_reset_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "organizations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"monitor_id" uuid NOT NULL,
	"content_text" text NOT NULL,
	"content_hash" varchar(64) NOT NULL,
	"content_length" integer DEFAULT 0 NOT NULL,
	"status_code" integer,
	"response_time_ms" integer,
	"captured_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(320) NOT NULL,
	"name" varchar(255),
	"avatar_url" text,
	"supabase_auth_id" uuid NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_supabase_auth_id_unique" UNIQUE("supabase_auth_id")
);
--> statement-breakpoint
ALTER TABLE "alert_configs" ADD CONSTRAINT "alert_configs_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "alert_configs" ADD CONSTRAINT "alert_configs_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changes" ADD CONSTRAINT "changes_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changes" ADD CONSTRAINT "changes_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changes" ADD CONSTRAINT "changes_snapshot_before_id_snapshots_id_fk" FOREIGN KEY ("snapshot_before_id") REFERENCES "public"."snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "changes" ADD CONSTRAINT "changes_snapshot_after_id_snapshots_id_fk" FOREIGN KEY ("snapshot_after_id") REFERENCES "public"."snapshots"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monitors" ADD CONSTRAINT "monitors_org_id_organizations_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organizations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_owner_id_users_id_fk" FOREIGN KEY ("owner_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "snapshots" ADD CONSTRAINT "snapshots_monitor_id_monitors_id_fk" FOREIGN KEY ("monitor_id") REFERENCES "public"."monitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_changes_monitor" ON "changes" USING btree ("monitor_id");--> statement-breakpoint
CREATE INDEX "idx_changes_org" ON "changes" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_monitors_org" ON "monitors" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_monitors_next_check" ON "monitors" USING btree ("next_check_at");--> statement-breakpoint
CREATE INDEX "idx_snapshots_monitor" ON "snapshots" USING btree ("monitor_id");