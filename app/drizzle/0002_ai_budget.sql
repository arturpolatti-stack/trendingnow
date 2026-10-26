CREATE TABLE "ai_reservations" (
	"id" text PRIMARY KEY NOT NULL,
	"store_id" text NOT NULL,
	"request_key" text NOT NULL,
	"reserved_micros" bigint NOT NULL,
	"actual_micros" bigint,
	"status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"settled_at" timestamp with time zone
);
--> statement-breakpoint
CREATE INDEX "ai_reservations_store_created_idx" ON "ai_reservations" USING btree ("store_id","created_at");--> statement-breakpoint
CREATE INDEX "ai_reservations_request_idx" ON "ai_reservations" USING btree ("request_key");