import { Router } from 'express';
import { body, validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';


const router = Router();

function signToken(user) {
  return jwt.sign(
    { sub: user._id.toString(), name: user.name, roles: user.roles },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
}

/**
 * POST /auth/register
 * Apenas para criar usuário inicial. Em produção, restrinja!
 */
router.post('/register',
  body('name').isString().isLength({ min: 2 }),
  body('email').isEmail(),
  body('password').isString().isLength({ min: 6 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { name, email, password } = req.body;
      const exists = await User.findOne({ email });
      if (exists) return res.status(409).json({ error: 'E-mail já cadastrado' });

      const passwordHash = await User.hashPassword(password);
      const user = await User.create({ name, email, passwordHash, roles: ['organizer'] });

      const token = signToken(user);
      res.status(201).json({ token, user: { _id: user._id, name: user.name, email: user.email } });
    } catch (e) { next(e); }
  }
);

/**
 * POST /auth/login
 */
router.post('/login',
  body('email').isEmail(),
  body('password').isString().isLength({ min: 6 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(401).json({ error: 'Credenciais inválidas' });

      const ok = await user.comparePassword(password);
      if (!ok) return res.status(401).json({ error: 'Credenciais inválidas' });

      const token = signToken(user);
      res.json({
        token,
        user: { _id: user._id, name: user.name, email: user.email, photoUrl: user.photoUrl, preferences: user.preferences }
      });
    } catch (e) { next(e); }
  }
);


router.post('/forgot-password',
  body('email').isEmail(),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email } = req.body;
      const user = await User.findOne({ email });

      // Para não revelar se o e-mail existe, retornamos 200 mesmo se não existir.
      if (!user) {
        return res.json({ ok: true });
      }

      // Gera um código de 6 dígitos (000000–999999)
      const code = String(Math.floor(100000 + Math.random() * 900000));
      const codeHash = await bcrypt.hash(code, 10);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

      user.passwordReset = { codeHash, expiresAt, attempts: 0 };
      await user.save();

      // Envio de e-mail ficaria aqui (nodemailer, provider externo etc.)
      // Para DEV, retornamos o código (NÃO faça isso em produção).
      const payload = { ok: true };
      if (env.nodeEnv !== 'production') payload.devCode = code;

      return res.json(payload);
    } catch (e) { next(e); }
  }
);

router.post('/reset-password',
  body('email').isEmail(),
  body('code').isString().isLength({ min: 6, max: 6 }),
  body('newPassword').isString().isLength({ min: 6 }),
  async (req, res, next) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

      const { email, code, newPassword } = req.body;
      const user = await User.findOne({ email });
      if (!user || !user.passwordReset?.codeHash || !user.passwordReset?.expiresAt) {
        return res.status(400).json({ error: 'Solicite um novo código.' });
      }

      if (user.passwordReset.expiresAt < new Date()) {
        return res.status(400).json({ error: 'Código expirado. Solicite novamente.' });
      }

      const ok = await bcrypt.compare(code, user.passwordReset.codeHash);
      if (!ok) {
        // (opcional) incrementar tentativas
        user.passwordReset.attempts = (user.passwordReset.attempts ?? 0) + 1;
        await user.save();
        return res.status(400).json({ error: 'Código inválido.' });
      }

      // Trocar a senha
      user.passwordHash = await User.hashPassword(newPassword);
      user.passwordReset = { codeHash: null, expiresAt: null, attempts: 0 }; // limpa
      await user.save();

      // (opcional) já loga o usuário após redefinir
      const token = jwt.sign(
        { sub: user._id.toString(), name: user.name, roles: user.roles },
        env.jwt.secret,
        { expiresIn: env.jwt.expiresIn }
      );

      return res.json({
        token,
        user: { _id: user._id, name: user.name, email: user.email, photoUrl: user.photoUrl, preferences: user.preferences }
      });
    } catch (e) { next(e); }
  }
);

export default router;
