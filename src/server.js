// src/server.js
import mongoose from "mongoose";
import { env } from "./config/env.js";
import { createApp } from "./app.js";

const app = createApp();

mongoose
  .connect(env.mongoUri)
  .then(() => {
    app.listen(env.port, () =>
      console.log(`🚀 API on http://localhost:${env.port}`)
    );
  })
  .catch((err) => {
    console.error("❌ Mongo connection error:", err);
    process.exit(1);
  });
