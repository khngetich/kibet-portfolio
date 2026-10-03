// Copies every file in the media bucket (Supabase Storage, S3-compatible) to BACKUP_MEDIA_DIR.
// Reads S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY from the
// environment (scripts/backup.sh sets them; nothing is stored).
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { GetObjectCommand, ListObjectsV2Command, S3Client } from '@aws-sdk/client-s3';

const { S3_ENDPOINT, S3_REGION, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY, BACKUP_MEDIA_DIR } = process.env;
if (!BACKUP_MEDIA_DIR) throw new Error('BACKUP_MEDIA_DIR is not set');

const s3 = new S3Client({ endpoint: S3_ENDPOINT, region: S3_REGION, forcePathStyle: true, credentials: { accessKeyId: S3_ACCESS_KEY_ID, secretAccessKey: S3_SECRET_ACCESS_KEY } });

let token, count = 0, failed = 0;
do {
  const page = await s3.send(new ListObjectsV2Command({ Bucket: S3_BUCKET, ContinuationToken: token }));
  for (const { Key } of page.Contents ?? []) {
    if (!Key || Key.endsWith('/')) continue;
    try {
      const obj = await s3.send(new GetObjectCommand({ Bucket: S3_BUCKET, Key }));
      const file = join(BACKUP_MEDIA_DIR, Key);
      await mkdir(dirname(file), { recursive: true });
      await writeFile(file, Buffer.from(await obj.Body.transformToByteArray()));
      count++;
    } catch (err) {
      failed++;
      console.error(`   ✗ ${Key}: ${err.name}: ${err.message}`);
    }
  }
  token = page.IsTruncated ? page.NextContinuationToken : undefined;
} while (token);

console.log(`   ${count} file${count === 1 ? '' : 's'} copied${failed ? `, ${failed} failed` : ''}`);
if (failed) process.exit(1);
