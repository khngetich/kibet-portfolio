-- Point every id counter (serial / identity sequence) in the public schema just past its table's
-- highest id. Needed after a data copy with explicit ids, and safe to run any time: it only ever
-- moves a counter to MAX(id) + 1, so the next insert can't collide with an existing row.
DO $$
DECLARE
  r record;
BEGIN
  FOR r IN
    SELECT c.table_schema, c.table_name, c.column_name,
           pg_get_serial_sequence(format('%I.%I', c.table_schema, c.table_name), c.column_name) AS seq
    FROM information_schema.columns c
    WHERE c.table_schema = 'public' AND c.column_default LIKE 'nextval(%'
  LOOP
    IF r.seq IS NOT NULL THEN
      EXECUTE format('SELECT setval(%L, COALESCE((SELECT MAX(%I) FROM %I.%I), 0) + 1, false)',
                     r.seq, r.column_name, r.table_schema, r.table_name);
    END IF;
  END LOOP;
END $$;
