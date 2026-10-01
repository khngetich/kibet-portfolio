#!/usr/bin/env bash
# One-time production setup. Asks once for the Supabase *session pooler* connection string
# (typing hidden; never printed or written to disk), then:
#   1. builds and fills the Supabase database from the local one (scripts/push-content.sh)
#   2. stores the *transaction pooler* address (same string, port 6543) in Vercel as the
#      DATABASE_URL secret for Production and Preview
#   3. generates PAYLOAD_SECRET and stores it in Vercel as a secret, unless it is already set
# Run it yourself in a terminal:  scripts/setup-production.sh
set -euo pipefail
cd "$(dirname "$0")/.."

if [[ ! -t 0 ]]; then echo "Run this in a terminal window: it needs to ask for the connection string." >&2; exit 1; fi
printf 'Paste the Supabase session pooler connection string (with your password), then press Enter (hidden): '
read -rs TARGET_URL
echo
if [[ "$TARGET_URL" != postgres://* && "$TARGET_URL" != postgresql://* ]]; then echo "That isn't a postgresql:// connection string. Nothing was changed." >&2; exit 1; fi
if [[ "$TARGET_URL" == *"[YOUR-PASSWORD]"* ]]; then echo "Replace [YOUR-PASSWORD] in the string with your database password. Nothing was changed." >&2; exit 1; fi
if [[ "$TARGET_URL" != *":5432/"* ]]; then echo "Use the Session pooler string (port 5432). Nothing was changed." >&2; exit 1; fi
export TARGET_URL

echo "── 1/3  Supabase database ──"
scripts/push-content.sh

echo "── 2/3  DATABASE_URL in Vercel (transaction pooler, port 6543) ──"
printf '%s' "${TARGET_URL/:5432\//:6543/}" | vercel env add DATABASE_URL production,preview --sensitive --force --yes

echo "── 3/3  PAYLOAD_SECRET in Vercel ──"
if vercel env ls 2>/dev/null | grep -qE '^ +PAYLOAD_SECRET '; then
  echo "Already set; left as it is."
else
  openssl rand -hex 32 | tr -d '\n' | vercel env add PAYLOAD_SECRET production,preview --sensitive --yes
fi

unset TARGET_URL
echo "All set. Next: vercel  (preview), then  vercel --prod"
