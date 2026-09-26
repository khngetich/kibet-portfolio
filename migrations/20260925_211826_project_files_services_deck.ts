import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_services_layout" AS ENUM('deck', 'cards');
  CREATE TYPE "public"."enum__pages_v_blocks_services_layout" AS ENUM('deck', 'cards');
  CREATE TABLE "projects_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar
  );
  
  CREATE TABLE "_projects_v_version_stats" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"value" varchar,
  	"label" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "pages_blocks_services" ADD COLUMN "layout" "enum_pages_blocks_services_layout" DEFAULT 'deck';
  ALTER TABLE "pages_blocks_services" ADD COLUMN "cta_label" varchar DEFAULT 'Inquire for this service';
  ALTER TABLE "_pages_v_blocks_services" ADD COLUMN "layout" "enum__pages_v_blocks_services_layout" DEFAULT 'deck';
  ALTER TABLE "_pages_v_blocks_services" ADD COLUMN "cta_label" varchar DEFAULT 'Inquire for this service';
  ALTER TABLE "projects_stats" ADD CONSTRAINT "projects_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_stats" ADD CONSTRAINT "_projects_v_version_stats_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_stats_order_idx" ON "projects_stats" USING btree ("_order");
  CREATE INDEX "projects_stats_parent_id_idx" ON "projects_stats" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_stats_order_idx" ON "_projects_v_version_stats" USING btree ("_order");
  CREATE INDEX "_projects_v_version_stats_parent_id_idx" ON "_projects_v_version_stats" USING btree ("_parent_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_stats" CASCADE;
  DROP TABLE "_projects_v_version_stats" CASCADE;
  ALTER TABLE "pages_blocks_services" DROP COLUMN "layout";
  ALTER TABLE "pages_blocks_services" DROP COLUMN "cta_label";
  ALTER TABLE "_pages_v_blocks_services" DROP COLUMN "layout";
  ALTER TABLE "_pages_v_blocks_services" DROP COLUMN "cta_label";
  DROP TYPE "public"."enum_pages_blocks_services_layout";
  DROP TYPE "public"."enum__pages_v_blocks_services_layout";`)
}
