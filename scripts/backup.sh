#!/usr/bin/env bash
# Backs up the live site: a full database dump plus a copy of every media file.
#
#   npm run backup                 → ~/Backups/portfolio/<date-time>/
#   BACKUP_DIR=/Volumes/Drive npm run backup
#
# Reads DATABASE_URL from .env (or the environment). The media copy needs the Supabase Storage
# S3 keys; if they aren't in the environment it asks for them (hidden input, nothing is saved).
# Restore the database with:  pg_restore --clean --no-owner -d "$TARGET_URL" <dir>/database.dump
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ -z "${DATABASE_URL:-}" && -f .env ]]; then
  DATABASE_URL="$(grep -E '^DATABASE_URL=' .env | head -1 | cut -d= -f2- | sed -e 's/^"//' -e 's/"$//')"
fi
[[ -n "${DATABASE_URL:-}" ]] || { echo "DATABASE_URL is not set (and not found in .env)." >&2; exit 1; }

# pg_dump must be at least as new as the server
server_major="$(psql "$DATABASE_URL" -tAc 'show server_version' | cut -d. -f1 | tr -d ' ')"
PG_DUMP=""
for candidate in "/opt/homebrew/opt/postgresql@${server_major}/bin/pg_dump" "/usr/local/opt/postgresql@${server_major}/bin/pg_dump" "$(command -v pg_dump || true)"; do
  [[ -x "$candidate" ]] || continue
  [[ "$("$candidate" --version | grep -oE '[0-9]+' | head -1)" -ge "$server_major" ]] && { PG_DUMP="$candidate"; break; }
done
if [[ -z "$PG_DUMP" ]]; then
  echo "The database runs Postgres $server_major, and pg_dump must be at least that version." >&2
  echo "Install it with:  brew install postgresql@${server_major}   (then run this again)" >&2
  exit 1
fi

dest="${BACKUP_DIR:-$HOME/Backups/portfolio}/$(date +%Y-%m-%d_%H%M)"
mkdir -p "$dest"
chmod 700 "$dest"

echo "→ Database ($("$PG_DUMP" --version | awk '{print $NF}')) → $dest/database.dump"
"$PG_DUMP" "$DATABASE_URL" --format=custom --no-owner --no-privileges --file "$dest/database.dump"

echo "→ Media"
for v in S3_ENDPOINT S3_REGION S3_BUCKET; do
  if [[ -z "${!v:-}" ]]; then
    val="$(grep -E "^$v=" .env 2>/dev/null | head -1 | cut -d= -f2- || true)"
    [[ -n "$val" ]] || read -rp "  $v: " val
    export "$v=$val"
  fi
done
[[ -n "${S3_ACCESS_KEY_ID:-}" ]] || { read -rsp "  S3 access key id (hidden): " S3_ACCESS_KEY_ID; echo; export S3_ACCESS_KEY_ID; }
[[ -n "${S3_SECRET_ACCESS_KEY:-}" ]] || { read -rsp "  S3 secret access key (hidden): " S3_SECRET_ACCESS_KEY; echo; export S3_SECRET_ACCESS_KEY; }
BACKUP_MEDIA_DIR="$dest/media" node scripts/backup-media.mjs

echo "✓ Backup complete: $dest"
echo "  Keep a copy somewhere other than this computer (an external drive or cloud folder)."
