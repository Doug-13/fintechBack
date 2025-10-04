import crypto from 'crypto';

export function verifyWebhook(req, res, next) {
  const signature = req.headers['x-webhook-signature'] || '';
  const secret = process.env.PIX_WEBHOOK_SECRET || '';
  const payload = JSON.stringify(req.body || {});

  const expected = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');

  if (!secret) {
    // Em desenvolvimento, se não houver secret, permitimos para facilitar testes
    return next();
  }

  try {
    if (crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature))) {
      return next();
    }
  } catch (_) {}
  return res.status(401).json({ message: 'Assinatura de webhook inválida' });
}