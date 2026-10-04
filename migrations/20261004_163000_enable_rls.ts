import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Locks the database away from Supabase's Data API (PostgREST). Payload talks to Postgres
 * directly as the `postgres` role, which owns every table and bypasses RLS, so the site and the
 * CMS are unaffected; this only shuts the side door the public `anon` key could open (it could
 * read and insert rows, `users` and `inquiries` included).
 *
 * 1. RLS on for every table in `public`, with no policies: the API roles see nothing.
 * 2. `anon` and `authenticated` lose their grants on everything in `public`, now and (default
 *    privileges) for tables later migrations create.
 * 3. An event trigger turns RLS on for any table created later, so Supabase's "RLS Disabled in
 *    Public" warning doesn't come back after the next migration. Skipped where the role may not
 *    create event triggers.
 *
 * Steps 2 and 3 only run where Supabase's roles exist, so the migration also runs on a plain
 * local Postgres.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
  DO $$
  DECLARE t record;
  BEGIN
    FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND NOT c.relrowsecurity
    LOOP
      EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', t.relname);
    END LOOP;
  END $$;

  DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') AND EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
      REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
      REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon, authenticated;
      REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon, authenticated;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON TABLES FROM anon, authenticated;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON SEQUENCES FROM anon, authenticated;
      ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE ALL ON FUNCTIONS FROM anon, authenticated;
    END IF;
  END $$;

  CREATE OR REPLACE FUNCTION public.rls_on_new_tables() RETURNS event_trigger LANGUAGE plpgsql AS $fn$
  DECLARE obj record;
  BEGIN
    FOR obj IN SELECT * FROM pg_event_trigger_ddl_commands() WHERE command_tag = 'CREATE TABLE' AND schema_name = 'public'
    LOOP
      EXECUTE format('ALTER TABLE %s ENABLE ROW LEVEL SECURITY', obj.object_identity);
    END LOOP;
  END $fn$;

  DO $$
  BEGIN
    IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') AND NOT EXISTS (SELECT 1 FROM pg_event_trigger WHERE evtname = 'rls_on_new_tables') THEN
      CREATE EVENT TRIGGER rls_on_new_tables ON ddl_command_end WHEN TAG IN ('CREATE TABLE') EXECUTE FUNCTION public.rls_on_new_tables();
    END IF;
  EXCEPTION WHEN insufficient_privilege THEN
    RAISE NOTICE 'event trigger skipped (no permission): enable RLS on new tables in later migrations';
  END $$;

  REVOKE ALL ON FUNCTION public.rls_on_new_tables() FROM PUBLIC;
  `)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // turns the trigger off and RLS back off; the revoked API grants are deliberately not restored
  await db.execute(sql`
  DROP EVENT TRIGGER IF EXISTS rls_on_new_tables;
  DROP FUNCTION IF EXISTS public.rls_on_new_tables();
  DO $$
  DECLARE t record;
  BEGIN
    FOR t IN SELECT c.relname FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
             WHERE n.nspname = 'public' AND c.relkind IN ('r', 'p') AND c.relrowsecurity
    LOOP
      EXECUTE format('ALTER TABLE public.%I DISABLE ROW LEVEL SECURITY', t.relname);
    END LOOP;
  END $$;
  `)
}
