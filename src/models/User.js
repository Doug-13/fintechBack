// src/models/User.js
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const themePrefsSchema = new mongoose.Schema(
  {
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, default: 'pt-BR' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true, index: true },
    passwordHash: { type: String, required: true },
    photoUrl: { type: String, default: null },
    preferences: { type: themePrefsSchema, default: () => ({}) },
    roles: [{ type: String, default: [] }],

    // Bloco de reset de senha
    passwordReset: {
      codeHash: { type: String, default: null },
      expiresAt: { type: Date, default: null },
      attempts: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// Método para comparar senha
userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.passwordHash);
};

// Método estático para gerar hash de senha
userSchema.statics.hashPassword = function (plain) {
  return bcrypt.hash(plain, 10);
};

export const User = mongoose.models.User || mongoose.model('User', userSchema);
