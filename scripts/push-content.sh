#!/usr/bin/env bash
# Copy the CMS from the local database into a hosted Postgres (e.g. Supabase):
#   1. dump the local content (data only; not the migration log, edit locks or admin UI prefs)
#   2. build the schema on the target with `payload migrate`
#   3. load the content into it, in one transaction (all or nothing)
#
# Run it yourself in a terminal: it asks for the Supabase *session pooler* string (typing is
# hidden and it is never printed or saved), or uses TARGET_URL if that is already set.
#   scripts/push-content.sh
#
# The target should be empty (a new project). The local database is only read, never changed.
set -euo pipefail

SOURCE_URL="${SOURCE_URL:-postgres://$(whoami)@localhost:5432/portfolio}"
if [[ -z "${TARGET_URL:-}" ]]; then
  if [[ ! -t 0 ]]; then
    echo "Run this in a terminal window (it needs to ask for the connection string), or set TARGET_URL first." >&2
    exit 1
  fi
  printf 'Paste the Supabase session pooler connection string, then press Enter (hidden): '
  read -rs TARGET_URL
  echo
fi
if [[ "$TARGET_URL" != postgres://* && "$TARGET_URL" != postgresql://* ]]; then
  echo "That doesn't look like a postgresql:// connection string. Nothing was changed." >&2
  exit 1
fi
if [[ "$TARGET_URL" == *"[YOUR-PASSWORD]"* ]]; then
  echo "The string still has the [YOUR-PASSWORD] placeholder; put your database password in its place." >&2
  exit 1
fi
cd "$(dirname "$0")/.."

dump="$(mktemp -t cms-content).sql"

echo "1/3  Dumping content from the local database…"
pg_dump "$SOURCE_URL" --data-only --no-owner --no-privileges \
  --exclude-table='payload_migrations' --exclude-table='payload_locked_documents*' --exclude-table='payload_preferences*' \
  -f "$dump"

echo "2/3  Building the schema on the target (payload migrate)…"
DATABASE_URL="$TARGET_URL" npx cross-env NODE_OPTIONS=--no-deprecation payload migrate

counts="select 'pages ' || count(*) from pages union all select 'projects ' || count(*) from projects union all select 'media ' || count(*) from media union all select 'users ' || count(*) from users"
existing=$(psql "$TARGET_URL" -Atc "select (select count(*) from pages) + (select count(*) from projects) + (select count(*) from media) + (select count(*) from users)")
load="$(mktemp -t cms-load).sql"
trap 'rm -f "$dump" "$load"' EXIT
if [[ "$existing" -gt 0 ]]; then
  echo "The target already has content:"
  psql "$TARGET_URL" -At -c "$counts" | sed 's/^/   /'
  # CONTENT=keep|replace answers in advance; otherwise ask
  answer="${CONTENT:-}"
  if [[ -z "$answer" ]]; then
    printf 'Type "replace" to delete ALL of it and copy your local content in, or press Enter to keep it: '
    read -r answer </dev/tty
  fi
  if [[ "$answer" != "replace" ]]; then
    echo "3/3  Kept the existing content; nothing was copied."
    exit 0
  fi
  # empty every CMS table (not the migration log) in the same transaction as the load
  psql "$TARGET_URL" -At -c "select 'TRUNCATE ' || string_agg(format('%I.%I', schemaname, tablename), ', ') || ' RESTART IDENTITY CASCADE;' from pg_tables where schemaname = 'public' and tablename <> 'payload_migrations'" > "$load"
fi
cat "$dump" >> "$load"

echo "3/3  Loading the content…"
psql "$TARGET_URL" -v ON_ERROR_STOP=1 --single-transaction -q -o /dev/null -f "$load"

echo "Done. Counts on the target:"
psql "$TARGET_URL" -At -c "$counts" | sed 's/^/   /'
