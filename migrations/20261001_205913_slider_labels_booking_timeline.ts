import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects_blocks_before_after" ADD COLUMN "before_label" varchar;
  ALTER TABLE "projects_blocks_before_after" ADD COLUMN "after_label" varchar;
  ALTER TABLE "_projects_v_blocks_before_after" ADD COLUMN "before_label" varchar;
  ALTER TABLE "_projects_v_blocks_before_after" ADD COLUMN "after_label" varchar;
  ALTER TABLE "inquiries" ADD COLUMN "timeline" varchar;
  ALTER TABLE "site" ADD COLUMN "booking_url" varchar;
  ALTER TABLE "_site_v" ADD COLUMN "version_booking_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "projects_blocks_before_after" DROP COLUMN "before_label";
  ALTER TABLE "projects_blocks_before_after" DROP COLUMN "after_label";
  ALTER TABLE "_projects_v_blocks_before_after" DROP COLUMN "before_label";
  ALTER TABLE "_projects_v_blocks_before_after" DROP COLUMN "after_label";
  ALTER TABLE "inquiries" DROP COLUMN "timeline";
  ALTER TABLE "site" DROP COLUMN "booking_url";
  ALTER TABLE "_site_v" DROP COLUMN "version_booking_url";`)
}
