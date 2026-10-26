CREATE TABLE "briefings" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"fields" jsonb NOT NULL,
	"reasons" jsonb NOT NULL,
	"uncertainty" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "decisions" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"kind" text NOT NULL,
	"reason" text NOT NULL,
	"stage" text,
	"missing_evidence" text,
	"decided_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "observations" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"dimension" text NOT NULL,
	"source" text NOT NULL,
	"source_url" text NOT NULL,
	"term" text NOT NULL,
	"metric" text NOT NULL,
	"unit" text NOT NULL,
	"value" jsonb NOT NULL,
	"country" text NOT NULL,
	"language" text NOT NULL,
	"period_start" text,
	"period_end" text,
	"collected_at" timestamp with time zone NOT NULL,
	"method" text NOT NULL,
	"normalization" text
);
--> statement-breakpoint
CREATE TABLE "opportunities" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"product" text NOT NULL,
	"audience" text NOT NULL,
	"occasion" text NOT NULL,
	"style" text NOT NULL,
	"format" text NOT NULL,
	"language" text NOT NULL,
	"market" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "store_profiles" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"name" text NOT NULL,
	"market" text NOT NULL,
	"categories" text NOT NULL,
	"capacity" text NOT NULL,
	"max_effort_hours" double precision
);
--> statement-breakpoint
CREATE INDEX "briefings_store_idx" ON "briefings" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "decisions_store_idx" ON "decisions" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "observations_store_opp_idx" ON "observations" USING btree ("store_id","opportunity_id");--> statement-breakpoint
CREATE INDEX "opportunities_store_idx" ON "opportunities" USING btree ("store_id");--> statement-breakpoint
CREATE INDEX "store_profiles_store_idx" ON "store_profiles" USING btree ("store_id");