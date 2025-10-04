// src/routes/events.routes.js
import { Router } from 'express';
import Event from '../models/Event.js';
import Participant from '../models/Participant.js';
import { auth } from '../middleware/auth.js';

const router = Router();

// Criar evento/vaquinha
router.post('/', auth, async (req, res) => {
  try {
    const {
      tipo = 'vaquinha',       // 'evento' | 'vaquinha'
      nome,
      descricao,
      data,
      valorIngresso,           // para 'evento'
      vagas,                   // para 'evento'
      valorSugerido,           // para 'vaquinha'
      metaArrecadacao,         // opcional em 'vaquinha'
    } = req.body;

    if (!nome || !data) {
      return res.status(400).json({ message: 'Campos obrigatórios: nome, data' });
    }

    if (tipo === 'evento') {
      if (valorIngresso == null || vagas == null) {
        return res.status(400).json({ message: 'Para "evento": valorIngresso e vagas são obrigatórios' });
      }
    } else if (tipo === 'vaquinha') {
      if (valorSugerido == null) {
        return res.status(400).json({ message: 'Para "vaquinha": valorSugerido é obrigatório' });
      }
    } else {
      return res.status(400).json({ message: 'tipo inválido (use "evento" ou "vaquinha")' });
    }
    const parseDateFlexible = (s) => {
      if (!s) return null;
      const str = String(s).trim();

      // YYYY-MM-DD (ISO básica)
      if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return new Date(str);

      // DD/MM/AAAA ou DD-MM-AAAA
      const m = str.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
      if (m) {
        const [, dd, mm, yyyy] = m;
        const d = new Date(+yyyy, +mm - 1, +dd);
        if (d && d.getFullYear() === +yyyy && d.getMonth() === +mm - 1 && d.getDate() === +dd) return d;
      }
      return null;
    };

    // ...
    const rawData = req.body.data;
    const parsedDate = parseDateFlexible(rawData);
    if (!parsedDate) return res.status(400).json({ message: 'Data inválida. Use DD/MM/AAAA ou AAAA-MM-DD.' });

    const payload = {
      organizadorId: req.user._id ?? req.user.id,
      tipo,
      nome,
      descricao,
      data: parsedDate, // <- use o Date parseado aqui
      ...(tipo === 'evento' ? {
        valorIngresso: Number(valorIngresso),
        vagas: Number(vagas),
      } : {}),
      ...(tipo === 'vaquinha' ? {
        valorSugerido: Number(valorSugerido),
        ...(metaArrecadacao != null ? { metaArrecadacao: Number(metaArrecadacao) } : {})
      } : {}),
    };

    const event = await Event.create(payload);
    console.log('[POST /eventos] criado:', event._id?.toString?.(), 'payload-salvo:', event.toObject());
    return res.status(201).json(event);
  } catch (err) {
    return res.status(500).json({ message: 'Erro ao criar evento', error: err.message });
  }
});

// Listar eventos do organizador
router.get('/', auth, async (req, res) => {
  try {
    const organizadorId = (req.user._id ?? req.user.id);
    const events = await Event.find({ organizadorId }).sort({ createdAt: -1 });
    res.json(events);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao listar eventos', error: err.message });
  }
});

// Buscar um evento do organizador
router.get('/:id', auth, async (req, res) => {
  try {
    const organizadorId = (req.user._id ?? req.user.id);
    const event = await Event.findOne({ _id: req.params.id, organizadorId });
    if (!event) return res.status(404).json({ message: 'Evento não encontrado' });
    res.json(event);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar evento', error: err.message });
  }
});

// Participantes de um evento (organizador)
router.get('/:id/participants', auth, async (req, res) => {
  try {
    const organizadorId = (req.user._id ?? req.user.id);
    const event = await Event.findOne({ _id: req.params.id, organizadorId });
    if (!event) return res.status(404).json({ message: 'Evento não encontrado' });

    const parts = await Participant.find({ eventoId: event._id }).sort({ createdAt: -1 });
    res.json(parts);
  } catch (err) {
    res.status(500).json({ message: 'Erro ao buscar participantes', error: err.message });
  }
});

// retorna [{ _id, pagosCount, vagas, ... }]
router.get('/summary', auth, async (req, res) => {
  const organizadorId = req.user._id ?? req.user.id;
  const events = await Event.find({ organizadorId }, { _id: 1, vagas: 1, tipo: 1 });
  // conte participantes por evento (ex.: status==='paid', se tiver esse campo)
  const parts = await Participant.aggregate([
    { $match: { organizadorId, /* se tiver campo: status: 'paid' */ } },
    { $group: { _id: '$eventoId', pagosCount: { $sum: 1 } } }
  ]);
  const map = new Map(parts.map(p => [String(p._id), p.pagosCount]));
  res.json(events.map(e => ({
    eventId: e._id,
    tipo: e.tipo,
    vagas: e.vagas ?? null,
    pagosCount: map.get(String(e._id)) ?? 0,
  })));
});


export default router;
