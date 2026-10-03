import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The About banner's own services list (title + description rows) becomes a relationship to the
// Services collection. Before its tables are dropped, each banner's rows are matched to services
// by title (exact, ignoring case, or a service whose title starts with it: "Brand Identity" →
// "Brand Identity & Systems") and written as relationship rows. A banner is carried over only
// when every one of its rows matches; otherwise it's left empty, which lists every published
// service, rather than shrinking to the few that matched. The same for page versions.
const matchService = (title: string) => `(SELECT sv.id FROM "services" sv
      WHERE lower(sv.title) = lower(${title}) OR lower(sv.title) LIKE lower(${title}) || ' %'
      ORDER BY (lower(sv.title) = lower(${title})) DESC, sv.id LIMIT 1)`;

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql.raw(`
  WITH m AS (
    SELECT b._parent_id AS parent, b._order AS pos, b.id AS block, s._order AS ord, ${matchService('s.title')} AS service_id
    FROM "pages_blocks_about_banner" b JOIN "pages_blocks_about_banner_services" s ON s._parent_id = b.id
  ), ok AS (
    SELECT DISTINCT ON (block, service_id) * FROM m
    WHERE block NOT IN (SELECT block FROM m WHERE service_id IS NULL)
    ORDER BY block, service_id, ord
  )
  INSERT INTO "pages_rels" ("order", parent_id, path, services_id)
  SELECT ROW_NUMBER() OVER (PARTITION BY block ORDER BY ord), parent, 'sections.' || (pos - 1) || '.services', service_id FROM ok;

  WITH m AS (
    SELECT b._parent_id AS parent, b._order AS pos, b.id AS block, s._order AS ord, ${matchService('s.title')} AS service_id
    FROM "_pages_v_blocks_about_banner" b JOIN "_pages_v_blocks_about_banner_services" s ON s._parent_id = b.id
  ), ok AS (
    SELECT DISTINCT ON (block, service_id) * FROM m
    WHERE block NOT IN (SELECT block FROM m WHERE service_id IS NULL)
    ORDER BY block, service_id, ord
  )
  INSERT INTO "_pages_v_rels" ("order", parent_id, path, services_id)
  SELECT ROW_NUMBER() OVER (PARTITION BY block ORDER BY ord), parent, 'version.sections.' || (pos - 1) || '.services', service_id FROM ok;`))

  await db.execute(sql`
   ALTER TABLE "pages_blocks_about_banner_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_services_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_about_banner_services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_services_items" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_about_banner_services" CASCADE;
  DROP TABLE "pages_blocks_services_items" CASCADE;
  DROP TABLE "_pages_v_blocks_about_banner_services" CASCADE;
  DROP TABLE "_pages_v_blocks_services_items" CASCADE;
  ALTER TABLE "pages_blocks_services" ADD COLUMN "labels_featured" varchar;
  ALTER TABLE "pages_blocks_services" ADD COLUMN "labels_extras" varchar;
  ALTER TABLE "pages_blocks_services" ADD COLUMN "labels_deck_hint" varchar;
  ALTER TABLE "pages_blocks_contact" ADD COLUMN "book_label" varchar;
  ALTER TABLE "_pages_v_blocks_services" ADD COLUMN "labels_featured" varchar;
  ALTER TABLE "_pages_v_blocks_services" ADD COLUMN "labels_extras" varchar;
  ALTER TABLE "_pages_v_blocks_services" ADD COLUMN "labels_deck_hint" varchar;
  ALTER TABLE "_pages_v_blocks_contact" ADD COLUMN "book_label" varchar;
  ALTER TABLE "posts" ADD COLUMN "meta_description" varchar;
  ALTER TABLE "posts" ADD COLUMN "og_image_id" integer;
  ALTER TABLE "_posts_v" ADD COLUMN "version_meta_description" varchar;
  ALTER TABLE "_posts_v" ADD COLUMN "version_og_image_id" integer;
  ALTER TABLE "posts" ADD CONSTRAINT "posts_og_image_id_media_id_fk" FOREIGN KEY ("og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_posts_v" ADD CONSTRAINT "_posts_v_version_og_image_id_media_id_fk" FOREIGN KEY ("version_og_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "posts_og_image_idx" ON "posts" USING btree ("og_image_id");
  CREATE INDEX "_posts_v_version_version_og_image_idx" ON "_posts_v" USING btree ("version_og_image_id");
  DROP TYPE "public"."enum_pages_blocks_services_items_currency";
  DROP TYPE "public"."enum__pages_v_blocks_services_items_currency";`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_services_items_currency" AS ENUM('KES', 'USD');
  CREATE TYPE "public"."enum__pages_v_blocks_services_items_currency" AS ENUM('KES', 'USD');
  CREATE TABLE "pages_blocks_about_banner_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "pages_blocks_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"price_from" numeric,
  	"currency" "enum_pages_blocks_services_items_currency" DEFAULT 'KES',
  	"unit" varchar,
  	"image_id" integer,
  	"image_caption" varchar,
  	"featured" boolean,
  	"starter" boolean
  );
  
  CREATE TABLE "_pages_v_blocks_about_banner_services" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"price_from" numeric,
  	"currency" "enum__pages_v_blocks_services_items_currency" DEFAULT 'KES',
  	"unit" varchar,
  	"image_id" integer,
  	"image_caption" varchar,
  	"featured" boolean,
  	"starter" boolean,
  	"_uuid" varchar
  );
  
  ALTER TABLE "posts" DROP CONSTRAINT "posts_og_image_id_media_id_fk";
  
  ALTER TABLE "_posts_v" DROP CONSTRAINT "_posts_v_version_og_image_id_media_id_fk";
  
  DROP INDEX "posts_og_image_idx";
  DROP INDEX "_posts_v_version_version_og_image_idx";
  ALTER TABLE "pages_blocks_about_banner_services" ADD CONSTRAINT "pages_blocks_about_banner_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_about_banner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_items" ADD CONSTRAINT "pages_blocks_services_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_items" ADD CONSTRAINT "pages_blocks_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_about_banner_services" ADD CONSTRAINT "_pages_v_blocks_about_banner_services_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_about_banner"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_items" ADD CONSTRAINT "_pages_v_blocks_services_items_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_items" ADD CONSTRAINT "_pages_v_blocks_services_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_services"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_about_banner_services_order_idx" ON "pages_blocks_about_banner_services" USING btree ("_order");
  CREATE INDEX "pages_blocks_about_banner_services_parent_id_idx" ON "pages_blocks_about_banner_services" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_items_order_idx" ON "pages_blocks_services_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_items_parent_id_idx" ON "pages_blocks_services_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_items_image_idx" ON "pages_blocks_services_items" USING btree ("image_id");
  CREATE INDEX "_pages_v_blocks_about_banner_services_order_idx" ON "_pages_v_blocks_about_banner_services" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_about_banner_services_parent_id_idx" ON "_pages_v_blocks_about_banner_services" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_items_order_idx" ON "_pages_v_blocks_services_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_items_parent_id_idx" ON "_pages_v_blocks_services_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_items_image_idx" ON "_pages_v_blocks_services_items" USING btree ("image_id");
  ALTER TABLE "pages_blocks_services" DROP COLUMN "labels_featured";
  ALTER TABLE "pages_blocks_services" DROP COLUMN "labels_extras";
  ALTER TABLE "pages_blocks_services" DROP COLUMN "labels_deck_hint";
  ALTER TABLE "pages_blocks_contact" DROP COLUMN "book_label";
  ALTER TABLE "_pages_v_blocks_services" DROP COLUMN "labels_featured";
  ALTER TABLE "_pages_v_blocks_services" DROP COLUMN "labels_extras";
  ALTER TABLE "_pages_v_blocks_services" DROP COLUMN "labels_deck_hint";
  ALTER TABLE "_pages_v_blocks_contact" DROP COLUMN "book_label";
  ALTER TABLE "posts" DROP COLUMN "meta_description";
  ALTER TABLE "posts" DROP COLUMN "og_image_id";
  ALTER TABLE "_posts_v" DROP COLUMN "version_meta_description";
  ALTER TABLE "_posts_v" DROP COLUMN "version_og_image_id";`)
}
