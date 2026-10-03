#!/usr/bin/env bash
# One-time media storage setup for production (Supabase Storage). Before running it, in Supabase:
#   Storage → New bucket → name "media", Public bucket ON
#   Storage → Settings (S3 Connection) → New access key → copy the Access key ID and Secret
# Then run this in a terminal:  scripts/setup-storage.sh
# It asks for the session pooler string and the two keys (typing hidden; nothing is printed or
# saved locally), then: migrates the database, uploads ./media, checks a file is publicly
# readable, and stores DATABASE_URL and the S3_* settings in Vercel (secrets hidden) for
# Production and Preview. Safe to run again.
set -euo pipefail
cd "$(dirname "$0")/.."
if [[ ! -t 0 ]]; then echo "Run this in a terminal window: it needs to ask for the keys." >&2; exit 1; fi

printf 'Supabase session pooler connection string (with your password), then Enter (hidden): '; read -rs TARGET_URL; echo
printf 'S3 Access key ID, then Enter (hidden): '; read -rs S3_ACCESS_KEY_ID; echo
printf 'S3 Secret access key, then Enter (hidden): '; read -rs S3_SECRET_ACCESS_KEY; echo
[[ "$TARGET_URL" == postgres*://* && "$TARGET_URL" != *"[YOUR-PASSWORD]"* ]] || { echo "That isn't a usable connection string. Nothing was changed." >&2; exit 1; }
[[ -n "$S3_ACCESS_KEY_ID" && -n "$S3_SECRET_ACCESS_KEY" ]] || { echo "Both S3 keys are needed. Nothing was changed." >&2; exit 1; }

# the project ref and region come from the pooler string: postgres.<ref>@aws-N-<region>.pooler.supabase.com
REF=$(sed -nE 's#^postgres(ql)?://postgres\.([a-z0-9]+):.*#\2#p' <<<"$TARGET_URL")
REGION=$(sed -nE 's#.*@aws-[0-9]+-([a-z0-9-]+)\.pooler\.supabase\.com.*#\1#p' <<<"$TARGET_URL")
[[ -n "$REF" && -n "$REGION" ]] || { echo "Use the Session pooler string (user postgres.<ref>, host aws-…pooler.supabase.com). Nothing was changed." >&2; exit 1; }
export S3_BUCKET=media S3_REGION="$REGION" S3_ENDPOINT="https://$REF.supabase.co/storage/v1/s3" S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY
S3_PUBLIC_URL="https://$REF.supabase.co/storage/v1/object/public/media"

echo "── 1/4  Database: pending migrations ──"
# an earlier content copy could leave id counters behind their rows; set them right first
psql "$TARGET_URL" -v ON_ERROR_STOP=1 -q -f scripts/fix-sequences.sql
DATABASE_URL="$TARGET_URL" npx cross-env NODE_OPTIONS=--no-deprecation payload migrate 2>&1 | grep -vE 'email adapter'

echo "── 2/4  Uploading ./media to the \"media\" bucket ──"
node scripts/upload-media.mjs

echo "── 3/4  Checking a file is publicly readable ──"
sample=$(ls media | grep -vE '^\.' | head -1)
code=$(curl -s -o /dev/null -w '%{http_code}' "$S3_PUBLIC_URL/media/$sample")
if [[ "$code" != "200" ]]; then
  echo "   $S3_PUBLIC_URL/media/$sample answered $code. Make the \"media\" bucket Public in Supabase, then run this again." >&2
  exit 1
fi
echo "   ✓ $sample loads from the public URL"

echo "── 4/4  Settings in Vercel ──"
# show Vercel's own messages (minus its banner) so a failure is never silent; stop on the first one
add() {
  local out
  if ! out=$(printf '%s' "$2" | vercel env add "$1" production,preview "$3" --force --yes 2>&1); then
    echo "$out" | grep -v '^Vercel CLI' >&2
    echo "   Couldn't save $1 to Vercel (see above). Fix that and run this again." >&2
    exit 1
  fi
  echo "   ✓ $1"
}
# the database address too, so Vercel always has the current password (transaction pooler, port 6543)
add DATABASE_URL "${TARGET_URL/:5432\//:6543/}" --sensitive
add S3_BUCKET "$S3_BUCKET" --no-sensitive
add S3_REGION "$S3_REGION" --no-sensitive
add S3_ENDPOINT "$S3_ENDPOINT" --no-sensitive
add S3_PUBLIC_URL "$S3_PUBLIC_URL" --no-sensitive
add S3_ACCESS_KEY_ID "$S3_ACCESS_KEY_ID" --sensitive
add S3_SECRET_ACCESS_KEY "$S3_SECRET_ACCESS_KEY" --sensitive

unset TARGET_URL S3_ACCESS_KEY_ID S3_SECRET_ACCESS_KEY
echo "All set. Next: vercel --prod"
