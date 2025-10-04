// src/models/Event.js
import mongoose from 'mongoose';

const EventSchema = new mongoose.Schema({
  organizadorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

  // 'evento' (com vagas) ou 'vaquinha' (sem vagas)
  tipo: { type: String, enum: ['evento', 'vaquinha'], default: 'evento', index: true },

  nome:       { type: String, required: true },
  descricao:  { type: String, default: '' },
  data:       { type: Date,   required: true },

  // ---- Evento tradicional ----
  valorIngresso: {
    type: Number,
    required: function () { return this.tipo === 'evento'; },
    min: 0,
  },
  vagas: {
    type: Number,
    required: function () { return this.tipo === 'evento'; },
    min: 1,
  },

  // ---- Vaquinha ----
  valorSugerido: {
    type: Number,
    required: function () { return this.tipo === 'vaquinha'; },
    min: 0,
  },
  metaArrecadacao: { type: Number, default: null, min: 0 },

  // Métrica útil para ambos
  totalArrecadado: { type: Number, default: 0, min: 0 },
}, { timestamps: true });

export default mongoose.model('Event', EventSchema);
