#!/usr/bin/env bash
# Point local development at the Supabase database (and, optionally, Supabase Storage).
# Asks for the Session pooler connection string and, if you want uploads to go to the bucket,
# the S3 keys (typing hidden; nothing is printed). It checks the connection first, keeps a
# backup of .env, then replaces only DATABASE_URL (and the S3_* lines); every other line stays.
# Run it yourself in a terminal:  scripts/use-supabase-locally.sh
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ ! -t 0 ]]; then echo "Run this in a terminal window: it needs to ask for the connection string." >&2; exit 1; fi
[[ -f .env ]] || { echo "No .env here." >&2; exit 1; }

printf 'Supabase Session pooler connection string (with your password), then Enter (hidden): '; read -rs URL; echo
[[ "$URL" == postgres*://postgres.*@aws-*.pooler.supabase.com:5432/* && "$URL" != *"[YOUR-PASSWORD]"* ]] \
  || { echo "That isn't the Session pooler string (user postgres.<ref>, host aws-…pooler.supabase.com, port 5432). Nothing was changed." >&2; exit 1; }

echo "Checking the connection…"
psql "$URL" -Atc "select 'connected: ' || count(*) || ' pages' from pages" || { echo "Couldn't connect with that string (check the password). Nothing was changed." >&2; exit 1; }

printf 'S3 Access key ID for uploads (or just Enter to skip; hidden): '; read -rs KEY_ID; echo
SECRET=''
if [[ -n "$KEY_ID" ]]; then printf 'S3 Secret access key (hidden): '; read -rs SECRET; echo; fi

REF=$(sed -nE 's#^postgres(ql)?://postgres\.([a-z0-9]+):.*#\2#p' <<<"$URL")
REGION=$(sed -nE 's#.*@aws-[0-9]+-([a-z0-9-]+)\.pooler\.supabase\.com.*#\1#p' <<<"$URL")

backup=".env.backup-$(date +%Y%m%d-%H%M%S)"
cp .env "$backup"

# rewrite in Python so the values never appear in a command line or the shell's history
URL="$URL" KEY_ID="$KEY_ID" SECRET="$SECRET" REF="$REF" REGION="$REGION" python3 - <<'PY'
import os, re
lines = open('.env').read().splitlines()
url, key, secret, ref, region = (os.environ[k] for k in ('URL', 'KEY_ID', 'SECRET', 'REF', 'REGION'))
updates = {'DATABASE_URL': url}
if key and secret:
    updates.update({
        'S3_BUCKET': 'media', 'S3_REGION': region,
        'S3_ENDPOINT': f'https://{ref}.supabase.co/storage/v1/s3',
        'S3_PUBLIC_URL': f'https://{ref}.supabase.co/storage/v1/object/public/media',
        'S3_ACCESS_KEY_ID': key, 'S3_SECRET_ACCESS_KEY': secret,
    })
out, seen = [], set()
for line in lines:
    m = re.match(r'^([A-Z0-9_]+)=', line)
    if m and m.group(1) in updates:
        name = m.group(1)
        if name == 'DATABASE_URL' and name not in seen:
            out.append('# previous: ' + re.sub(r'(://[^:@]+):[^@]*@', r'\1:***@', line))
        if name not in seen:
            out.append(f'{name}={updates[name]}')
            seen.add(name)
        continue
    out.append(line)
for name, value in updates.items():
    if name not in seen:
        out.append(f'{name}={value}')
open('.env', 'w').write('\n'.join(out) + '\n')
PY
chmod 600 .env "$backup"
unset URL KEY_ID SECRET
echo "Done: .env now uses Supabase$( [[ -n "${REGION:-}" ]] && printf ' (%s)' "$REGION" ). Backup: $backup"
echo "Restart the dev server so it picks this up."
