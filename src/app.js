import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import orgRoutes from './routes/organizations.js';
import userRoutes from './routes/users.js';
import uploadRoutes from './routes/uploads.js';
import { errorMiddleware } from './utils/errors.js';
import eventRoutes from './routes/events.js';

export function createApp() {
  const app = express();
  app.use(cors({
    origin: "http://localhost:19006", // Expo Web
    credentials: true
  }));
  app.use(express.json({ limit: '10mb' }));
  app.use(morgan('dev'));

  app.get('/health', (req, res) => res.json({ status: 'ok' }));

  app.use('/auth', authRoutes);
  app.use('/organizations', orgRoutes);
  app.use('/users', userRoutes);
  app.use('/uploads', uploadRoutes);
  app.use('/events', eventRoutes);

  app.use(errorMiddleware);
  return app;
}
