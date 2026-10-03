import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" ALTER COLUMN "featured" SET DEFAULT false;
  ALTER TABLE "services" ALTER COLUMN "starter" SET DEFAULT false;
  ALTER TABLE "_services_v" ALTER COLUMN "version_featured" SET DEFAULT false;
  ALTER TABLE "_services_v" ALTER COLUMN "version_starter" SET DEFAULT false;`)

  // Services saved before the defaults existed have NULL flags, which the admin list shows as
  // "general:null". Raw SQL rather than payload.update, so this replays safely on later configs.
  await db.execute(sql`
   UPDATE "services" SET "featured" = false WHERE "featured" IS NULL;
  UPDATE "services" SET "starter" = false WHERE "starter" IS NULL;
  UPDATE "_services_v" SET "version_featured" = false WHERE "version_featured" IS NULL;
  UPDATE "_services_v" SET "version_starter" = false WHERE "version_starter" IS NULL;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services" ALTER COLUMN "featured" DROP DEFAULT;
  ALTER TABLE "services" ALTER COLUMN "starter" DROP DEFAULT;
  ALTER TABLE "_services_v" ALTER COLUMN "version_featured" DROP DEFAULT;
  ALTER TABLE "_services_v" ALTER COLUMN "version_starter" DROP DEFAULT;`)
}
