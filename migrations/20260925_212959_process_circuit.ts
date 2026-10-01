import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

// The new 'circuit' layout becomes the default in the next migration: Postgres can't use an enum
// value in the same transaction that adds it ("unsafe use of new value").
export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TYPE "public"."enum_pages_blocks_process_steps_icon" ADD VALUE 'bulb';
  ALTER TYPE "public"."enum_pages_blocks_process_steps_icon" ADD VALUE 'chart';
  ALTER TYPE "public"."enum_pages_blocks_process_steps_icon" ADD VALUE 'sliders';
  ALTER TYPE "public"."enum_pages_blocks_process_steps_icon" ADD VALUE 'checkCircle';
  ALTER TYPE "public"."enum_pages_blocks_process_layout" ADD VALUE 'circuit' BEFORE 'steps';
  ALTER TYPE "public"."enum__pages_v_blocks_process_steps_icon" ADD VALUE 'bulb';
  ALTER TYPE "public"."enum__pages_v_blocks_process_steps_icon" ADD VALUE 'chart';
  ALTER TYPE "public"."enum__pages_v_blocks_process_steps_icon" ADD VALUE 'sliders';
  ALTER TYPE "public"."enum__pages_v_blocks_process_steps_icon" ADD VALUE 'checkCircle';
  ALTER TYPE "public"."enum__pages_v_blocks_process_layout" ADD VALUE 'circuit' BEFORE 'steps';
  ALTER TABLE "pages_blocks_process_steps" ADD COLUMN "duration" varchar;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD COLUMN "duration" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_process_steps" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_process_steps" ALTER COLUMN "icon" SET DEFAULT 'compass'::text;
  DROP TYPE "public"."enum_pages_blocks_process_steps_icon";
  CREATE TYPE "public"."enum_pages_blocks_process_steps_icon" AS ENUM('compass', 'pen', 'chat', 'rocket', 'layers', 'spark');
  ALTER TABLE "pages_blocks_process_steps" ALTER COLUMN "icon" SET DEFAULT 'compass'::"public"."enum_pages_blocks_process_steps_icon";
  ALTER TABLE "pages_blocks_process_steps" ALTER COLUMN "icon" SET DATA TYPE "public"."enum_pages_blocks_process_steps_icon" USING "icon"::"public"."enum_pages_blocks_process_steps_icon";
  ALTER TABLE "pages_blocks_process" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "pages_blocks_process" ALTER COLUMN "layout" SET DEFAULT 'steps'::text;
  DROP TYPE "public"."enum_pages_blocks_process_layout";
  CREATE TYPE "public"."enum_pages_blocks_process_layout" AS ENUM('steps', 'stack');
  ALTER TABLE "pages_blocks_process" ALTER COLUMN "layout" SET DEFAULT 'steps'::"public"."enum_pages_blocks_process_layout";
  ALTER TABLE "pages_blocks_process" ALTER COLUMN "layout" SET DATA TYPE "public"."enum_pages_blocks_process_layout" USING "layout"::"public"."enum_pages_blocks_process_layout";
  ALTER TABLE "_pages_v_blocks_process_steps" ALTER COLUMN "icon" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_process_steps" ALTER COLUMN "icon" SET DEFAULT 'compass'::text;
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_icon";
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_icon" AS ENUM('compass', 'pen', 'chat', 'rocket', 'layers', 'spark');
  ALTER TABLE "_pages_v_blocks_process_steps" ALTER COLUMN "icon" SET DEFAULT 'compass'::"public"."enum__pages_v_blocks_process_steps_icon";
  ALTER TABLE "_pages_v_blocks_process_steps" ALTER COLUMN "icon" SET DATA TYPE "public"."enum__pages_v_blocks_process_steps_icon" USING "icon"::"public"."enum__pages_v_blocks_process_steps_icon";
  ALTER TABLE "_pages_v_blocks_process" ALTER COLUMN "layout" SET DATA TYPE text;
  ALTER TABLE "_pages_v_blocks_process" ALTER COLUMN "layout" SET DEFAULT 'steps'::text;
  DROP TYPE "public"."enum__pages_v_blocks_process_layout";
  CREATE TYPE "public"."enum__pages_v_blocks_process_layout" AS ENUM('steps', 'stack');
  ALTER TABLE "_pages_v_blocks_process" ALTER COLUMN "layout" SET DEFAULT 'steps'::"public"."enum__pages_v_blocks_process_layout";
  ALTER TABLE "_pages_v_blocks_process" ALTER COLUMN "layout" SET DATA TYPE "public"."enum__pages_v_blocks_process_layout" USING "layout"::"public"."enum__pages_v_blocks_process_layout";
  ALTER TABLE "pages_blocks_process_steps" DROP COLUMN "duration";
  ALTER TABLE "_pages_v_blocks_process_steps" DROP COLUMN "duration";`)
}
