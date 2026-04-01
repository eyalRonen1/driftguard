ALTER TABLE "monitors" ADD COLUMN "health_status" varchar(20) DEFAULT 'healthy' NOT NULL;--> statement-breakpoint
ALTER TABLE "monitors" ADD COLUMN "health_reason" text;--> statement-breakpoint
ALTER TABLE "monitors" ADD COLUMN "health_checked_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "monitors" ADD COLUMN "last_healthy_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "monitors" ADD COLUMN "use_case" varchar(30);--> statement-breakpoint
CREATE INDEX "idx_alert_configs_org" ON "alert_configs" USING btree ("org_id");--> statement-breakpoint
CREATE INDEX "idx_alert_configs_monitor" ON "alert_configs" USING btree ("monitor_id");--> statement-breakpoint
CREATE INDEX "idx_changes_org_created" ON "changes" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "idx_monitors_active_schedule" ON "monitors" USING btree ("is_active","is_paused","next_check_at");--> statement-breakpoint
CREATE INDEX "idx_organizations_owner" ON "organizations" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "idx_snapshots_monitor_captured" ON "snapshots" USING btree ("monitor_id","captured_at");