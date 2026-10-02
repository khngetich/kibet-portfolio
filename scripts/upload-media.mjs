// Uploads every file in ./media to the S3-compatible bucket (Supabase Storage) under the same
// key Payload uses, `<prefix>/<filename>`, so existing media records find their files.
// Reads S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY from the
// environment (scripts/setup-storage.sh sets them; nothing is stored).
import { readdir, readFile } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

const { S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY } = process.env;
const PREFIX = 'media';
const TYPES = { '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.pdf': 'application/pdf', '.mp4': 'video/mp4', '.webm': 'video/webm' };

const s3 = new S3Client({ endpoint: S3_ENDPOINT, region: S3_REGION, forcePathStyle: true, credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY } });
const dir = join(process.cwd(), 'media');
const files = (await readdir(dir, { withFileTypes: true })).filter((f) => f.isFile() && !f.name.startsWith('.')).map((f) => f.name);

let failed = 0;
for (const name of files) {
  try {
    await s3.send(new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: `${PREFIX}/${name}`,
      Body: await readFile(join(dir, name)),
      ContentType: TYPES[extname(name).toLowerCase()] ?? 'application/octet-stream',
      CacheControl: 'public, max-age=31536000, immutable',
    }));
    console.log(`   ✓ ${name}`);
  } catch (err) {
    failed++;
    console.error(`   ✗ ${name}: ${err.name}: ${err.message}`);
  }
}
console.log(`   ${files.length - failed} of ${files.length} uploaded`);
if (failed) process.exit(1);
