import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" ADD COLUMN "credit_label" varchar;
  ALTER TABLE "footer" ADD COLUMN "credit_url" varchar;
  ALTER TABLE "_footer_v" ADD COLUMN "version_credit_label" varchar;
  ALTER TABLE "_footer_v" ADD COLUMN "version_credit_url" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "footer" DROP COLUMN "credit_label";
  ALTER TABLE "footer" DROP COLUMN "credit_url";
  ALTER TABLE "_footer_v" DROP COLUMN "version_credit_label";
  ALTER TABLE "_footer_v" DROP COLUMN "version_credit_url";`)
}
