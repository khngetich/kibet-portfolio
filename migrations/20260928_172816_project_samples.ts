import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_projects_live_type" AS ENUM('website', 'video', 'post');
  CREATE TYPE "public"."enum__projects_v_version_live_type" AS ENUM('website', 'video', 'post');
  CREATE TABLE "projects_samples" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"title" varchar,
  	"note" varchar
  );
  
  CREATE TABLE "_projects_v_version_samples" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"file_id" integer,
  	"title" varchar,
  	"note" varchar,
  	"_uuid" varchar
  );
  
  ALTER TABLE "projects" ADD COLUMN "timeline" varchar;
  ALTER TABLE "projects" ADD COLUMN "live_type" "enum_projects_live_type" DEFAULT 'website';
  ALTER TABLE "_projects_v" ADD COLUMN "version_timeline" varchar;
  ALTER TABLE "_projects_v" ADD COLUMN "version_live_type" "enum__projects_v_version_live_type" DEFAULT 'website';
  ALTER TABLE "projects_samples" ADD CONSTRAINT "projects_samples_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "projects_samples" ADD CONSTRAINT "projects_samples_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_projects_v_version_samples" ADD CONSTRAINT "_projects_v_version_samples_file_id_media_id_fk" FOREIGN KEY ("file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_projects_v_version_samples" ADD CONSTRAINT "_projects_v_version_samples_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_projects_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "projects_samples_order_idx" ON "projects_samples" USING btree ("_order");
  CREATE INDEX "projects_samples_parent_id_idx" ON "projects_samples" USING btree ("_parent_id");
  CREATE INDEX "projects_samples_file_idx" ON "projects_samples" USING btree ("file_id");
  CREATE INDEX "_projects_v_version_samples_order_idx" ON "_projects_v_version_samples" USING btree ("_order");
  CREATE INDEX "_projects_v_version_samples_parent_id_idx" ON "_projects_v_version_samples" USING btree ("_parent_id");
  CREATE INDEX "_projects_v_version_samples_file_idx" ON "_projects_v_version_samples" USING btree ("file_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "projects_samples" CASCADE;
  DROP TABLE "_projects_v_version_samples" CASCADE;
  ALTER TABLE "projects" DROP COLUMN "timeline";
  ALTER TABLE "projects" DROP COLUMN "live_type";
  ALTER TABLE "_projects_v" DROP COLUMN "version_timeline";
  ALTER TABLE "_projects_v" DROP COLUMN "version_live_type";
  DROP TYPE "public"."enum_projects_live_type";
  DROP TYPE "public"."enum__projects_v_version_live_type";`)
}
