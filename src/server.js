// src/server.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import eventsRoutes from './routes/events.js'; // 👈 importe as rotas de eventos (com .js)

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan(env.nodeEnv === 'development' ? 'dev' : 'combined'));

// Endpoints
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/eventos', eventsRoutes);             // 👈 monta aqui: agora POST /eventos existe

// Healthcheck para teste rápido
app.get('/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// 404 amigável (coloque DEPOIS das rotas)
app.use((req, res) => {
  console.warn('[404]', req.method, req.originalUrl);
  res.status(404).json({ error: 'Not found', path: req.originalUrl });
});

// Handler de erro (por último)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Erro interno' });
});

mongoose.connect(env.mongoUri).then(() => {
  app.listen(env.port, () => console.log(`API on http://localhost:${env.port}`));
}).catch(err => {
  console.error('Mongo error:', err);
  process.exit(1);
});
