<<<<<<< HEAD
// src/app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";

// Rotas
import authRoutes from "./routes/auth.js";
import orgRoutes from "./routes/organizations.js";
import userRoutes from "./routes/users.js";
import uploadRoutes from "./routes/uploads.js";
import eventRoutes from "./routes/events.js";
import profileBankingRoutes from "./routes/profileBanking.js";

// Middlewares
import { errorMiddleware } from "./utils/errors.js";

export function createApp() {
  const app = express();

  // Configurações globais
  app.use(
    cors({
      origin: "http://localhost:19006", // frontend local
      credentials: true,
    })
  );
  app.use(express.json({ limit: "10mb" }));
  app.use(morgan("dev"));

  // Healthcheck
  app.get("/health", (req, res) =>
    res.json({ status: "ok", time: new Date().toISOString() })
  );

  // Rotas principais
  app.use("/auth", authRoutes);
  app.use("/organizations", orgRoutes);
  app.use("/users", userRoutes);
  app.use("/uploads", uploadRoutes);
  app.use("/events", eventRoutes);
  app.use("/profileBanking", profileBankingRoutes);

  // Middleware de erro
  app.use(errorMiddleware);

  // 404 amigável
  app.use((req, res) => {
    console.warn("[404]", req.method, req.originalUrl);
    res.status(404).json({ error: "Not found", path: req.originalUrl });
  });

=======
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
>>>>>>> 0e2bd64bc502b4ddaedf59c1161fb53f233dba5b
  return app;
}
