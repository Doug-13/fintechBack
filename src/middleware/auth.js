import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { User } from '../models/User.js';

export async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'Token ausente' });

    const decoded = jwt.verify(token, env.jwt.secret);
    const user = await User.findById(decoded.sub);
    if (!user) return res.status(401).json({ error: 'Usuário não encontrado' });

    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Não autorizado' });
  }
}
