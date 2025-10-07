import dotenv from 'dotenv';
dotenv.config();

const bool = (v, def=false) => {
  if (v === undefined || v === null || v === '') return def;
  return String(v).toLowerCase() in { '1':1, 'true':1, 'yes':1, 'y':1 };
};

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 4000),
  mongoUri: process.env.MONGODB_URI,
  jwt: {
    secret: process.env.JWT_SECRET || 'devsecret',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  s3: {
    endpoint: process.env.S3_ENDPOINT || undefined,
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
    bucket: process.env.S3_BUCKET,
    forcePathStyle: bool(process.env.S3_FORCE_PATH_STYLE, false),
    publicBaseUrl: process.env.S3_PUBLIC_BASE_URL || null
  }
};

if (!env.mongoUri) {
  console.warn('[WARN] MONGODB_URI not set. Set it in your .env');
}
if (!env.s3.bucket) {
  console.warn('[WARN] S3_BUCKET not set. Set it in your .env');
}
