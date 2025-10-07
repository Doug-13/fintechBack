import { Router } from 'express';
import { auth } from '../middleware/auth.js';
import { env } from '../config/env.js';
import { s3Client } from '../config/s3.js';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import multer from 'multer';
import multerS3 from 'multer-s3';

const router = Router();

const ensureBucket = (req, res, next) => {
  if (!env.s3.bucket) {
    return res.status(503).json({ error: 'Object Storage não configurado (S3_BUCKET ausente)' });
  }
  next();
};

// --- Presign (PUT direto do cliente) ---
router.post('/presign', auth, ensureBucket, async (req, res, next) => {
  try {
    const { filename, contentType, folder = 'uploads' } = req.body || {};
    if (!filename || !contentType) {
      return res.status(400).json({ error: 'filename e contentType são obrigatórios' });
    }
    const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${filename}`;

    const command = new PutObjectCommand({
      Bucket: env.s3.bucket,
      Key: key,
      ContentType: contentType
    });
    const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 * 5 });
    const publicUrl = env.s3.publicBaseUrl ? `${env.s3.publicBaseUrl}/${key}` : null;

    res.json({ uploadUrl, key, publicUrl });
  } catch (e) { next(e); }
});

// --- Multipart (upload via servidor) ---
if (env.s3.bucket) {
  const upload = multer({
    storage: multerS3({
      s3: s3Client,
      bucket: env.s3.bucket,
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: (req, file, cb) => cb(null, { fieldName: file.fieldname }),
      key: (req, file, cb) => {
        const folder = req.query.folder || 'uploads';
        const key = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}-${file.originalname}`;
        cb(null, key);
      }
    })
  });

  router.post('/multipart', auth, upload.single('file'), (req, res) => {
    const file = /** @type any */(req.file);
    const key = file.key;
    const location = file.location || (env.s3.publicBaseUrl ? `${env.s3.publicBaseUrl}/${key}` : undefined);
    res.status(201).json({ key, location });
  });
} else {
  router.post('/multipart', auth, (req, res) => {
    res.status(503).json({ error: 'Object Storage não configurado (S3_BUCKET ausente)' });
  });
}

export default router;
