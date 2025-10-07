// back/src/models/Payment.js
import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
  {
    participanteId: { type: mongoose.Types.ObjectId, ref: 'Participant', required: true, index: true },
    eventoId: { type: mongoose.Types.ObjectId, ref: 'Event', required: true, index: true },
    valorBase: { type: Number, required: true },
    taxaServico: { type: Number, required: true, default: 0.5 },
    valorTotal: { type: Number, required: true },
    status: { type: String, enum: ['pendente', 'pago', 'falhado', 'expirado'], default: 'pendente' },
    txid: { type: String, index: true },
    emv: { type: String },
    qrCodeDataUrl: { type: String },
    provider: { type: String, default: () => process.env.PIX_PROVIDER || 'mock' },
    paidAt: { type: Date },
    expiresAt: { type: Date }
  },
  { timestamps: true }
);

export default mongoose.model('Payment', paymentSchema);
