import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_users_role" AS ENUM('admin', 'editor');
  CREATE TYPE "public"."enum__site_v_version_socials_platform" AS ENUM('instagram', 'behance', 'dribbble', 'linkedin', 'x', 'facebook', 'tiktok');
  CREATE TABLE "_site_v_version_socials" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"platform" "enum__site_v_version_socials_platform" NOT NULL,
  	"url" varchar NOT NULL,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_site_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"version_name" varchar NOT NULL,
  	"version_studio" varchar,
  	"version_role" varchar NOT NULL,
  	"version_location" varchar,
  	"version_availability" varchar,
  	"version_email" varchar NOT NULL,
  	"version_phone" varchar,
  	"version_whatsapp" boolean DEFAULT true,
  	"version_meta_description" varchar,
  	"version_og_image_id" integer,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "users" ADD COLUMN "role" "enum_users_role" DEFAULT 'editor' NOT NULL;
  -- everyone who could sign in before had full control: keep it that way, so no one is locked out
  UPDATE "users" SET "role" = 'admin';
  ALTER TABLE "_site_v_version_socials" ADD CONSTRAINT "_site_v_version_socials_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_site_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_site_v" ADD CONSTRAINT "_site_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "_site_v_version_socials_order_idx" ON "_site_v_version_socials" USING btree ("_order");
  CREATE INDEX "_site_v_version_socials_parent_id_idx" ON "_site_v_version_socials" USING btree ("_parent_id");
  CREATE INDEX "_site_v_version_version_og_image_idx" ON "_site_v" USING btree ("version_og_image_id");
  CREATE INDEX "_site_v_created_at_idx" ON "_site_v" USING btree ("created_at");
  CREATE INDEX "_site_v_updated_at_idx" ON "_site_v" USING btree ("updated_at");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   DROP TABLE "_site_v_version_socials" CASCADE;
  DROP TABLE "_site_v" CASCADE;
  ALTER TABLE "users" DROP COLUMN "role";
  DROP TYPE "public"."enum_users_role";
  DROP TYPE "public"."enum__site_v_version_socials_platform";`)
}
