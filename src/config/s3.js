import { S3Client } from '@aws-sdk/client-s3';
import { env } from './env.js';

export const s3Client = new S3Client({
  region: env.s3.region,
  forcePathStyle: env.s3.forcePathStyle,
  endpoint: env.s3.endpoint || undefined,
  credentials: {
    accessKeyId: env.s3.accessKeyId,
    secretAccessKey: env.s3.secretAccessKey
  }
});
