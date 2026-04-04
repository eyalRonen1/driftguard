ALTER TABLE "monitors" ADD COLUMN "watch_keywords" text;--> statement-breakpoint
ALTER TABLE "monitors" ADD COLUMN "keyword_mode" varchar(20) DEFAULT 'any';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "trial_ends_at" timestamp with time zone;