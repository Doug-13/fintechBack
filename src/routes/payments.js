// back/src/routes/payments.js
import { Router } from 'express';
import Event from '../models/Event.js';
import Participant from '../models/Participant.js';
import Payment from '../models/Payment.js';
import { pixProvider } from '../services/pixProvider.js';
import { verifyWebhook } from '../middleware/verifyWebhook.js';

const router = Router();

/**
 * Criar cobrança Pix Dinâmica (mock)
 * Body: { eventId, participante: { nome, email } }
 */
router.post('/pix', async (req, res) => {
  try {
    const { eventId, participante } = req.body;
    if (!eventId || !participante?.nome || !participante?.email) {
      return res.status(400).json({ message: 'Dados incompletos' });
    }

    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Evento não encontrado' });

    const part = await Participant.create({
      eventoId: event._id,
      nome: participante.nome,
      email: participante.email,
      statusPagamento: 'pendente'
    });

    const valorBase = Number(event.valorIngresso || 0);
    const taxaServico = 0.5;
    const valorTotal = Number((valorBase + taxaServico).toFixed(2));

    const charge = await pixProvider.createCharge({
      amount: valorTotal,
      description: `Ingresso ${event.nome}`
    });

    const payment = await Payment.create({
      participanteId: part._id,
      eventoId: event._id,
      valorBase,
      taxaServico,
      valorTotal,
      status: 'pendente',
      txid: charge.txid,
      emv: charge.emv,
      qrCodeDataUrl: charge.qrCodeDataUrl,
      provider: process.env.PIX_PROVIDER || 'mock',
      expiresAt: charge.expiresAt
    });

    res.status(201).json({
      participante: { id: part._id, nome: part.nome, email: part.email, statusPagamento: part.statusPagamento },
      pagamento: {
        id: payment._id,
        txid: payment.txid,
        valorTotal: payment.valorTotal,
        status: payment.status,
        emv: payment.emv,
        qrCodeDataUrl: payment.qrCodeDataUrl,
        expiresAt: payment.expiresAt
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Erro ao criar cobrança', error: err.message });
  }
});

// Status por id
router.get('/:id/status', async (req, res) => {
  const pay = await Payment.findById(req.params.id);
  if (!pay) return res.status(404).json({ message: 'Pagamento não encontrado' });

  // expiração simples
  if (pay.status === 'pendente' && pay.expiresAt && new Date(pay.expiresAt) < new Date()) {
    pay.status = 'expirado';
    await pay.save();
  }

  res.json({ status: pay.status, paidAt: pay.paidAt ?? null });
});

// Simular pagamento (marca como pago)
router.post('/:id/simulate', async (req, res) => {
  const pay = await Payment.findById(req.params.id);
  if (!pay) return res.status(404).json({ message: 'Pagamento não encontrado' });

  pay.status = 'pago';
  pay.paidAt = new Date();
  await pay.save();

  await Participant.findByIdAndUpdate(pay.participanteId, { statusPagamento: 'pago' });

  res.json({ ok: true, status: pay.status, paidAt: pay.paidAt });
});

// Listar por evento
router.get('/event/:eventId', async (req, res) => {
  const list = await Payment.find({ eventoId: req.params.eventId }).sort({ createdAt: -1 });
  res.json(list);
});

// (Opcional) Webhook com assinatura
router.post('/webhook', verifyWebhook, async (req, res) => {
  // Exemplo: { txid, status }
  const { txid, status } = req.body || {};
  if (!txid) return res.status(400).json({ message: 'txid ausente' });

  const pay = await Payment.findOne({ txid });
  if (!pay) return res.status(404).json({ message: 'Pagamento não encontrado' });

  if (status === 'pago' && pay.status !== 'pago') {
    pay.status = 'pago';
    pay.paidAt = new Date();
    await pay.save();
    await Participant.findByIdAndUpdate(pay.participanteId, { statusPagamento: 'pago' });
  }
  res.json({ ok: true });
});

export default router;
