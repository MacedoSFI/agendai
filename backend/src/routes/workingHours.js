const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const auth = require('../middleware/auth');

// GET /api/working-hours — busca horários do usuário
router.get('/', auth, async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM working_hours WHERE user_id = $1 ORDER BY day_of_week',
      [req.userId]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/working-hours — salva/atualiza horários (upsert)
router.post('/', auth, async (req, res) => {
  const { hours } = req.body;
  // hours = array de { day_of_week, is_open, start_time, end_time, lunch_start, lunch_end }
  try {
    await pool.query('BEGIN');
    for (const h of hours) {
      await pool.query(`
        INSERT INTO working_hours (user_id, day_of_week, is_open, start_time, end_time, lunch_start, lunch_end)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (user_id, day_of_week) DO UPDATE SET
          is_open = EXCLUDED.is_open,
          start_time = EXCLUDED.start_time,
          end_time = EXCLUDED.end_time,
          lunch_start = EXCLUDED.lunch_start,
          lunch_end = EXCLUDED.lunch_end,
          updated_at = NOW()
      `, [req.userId, h.day_of_week, h.is_open, h.start_time, h.end_time, h.lunch_start || null, h.lunch_end || null]);
    }
    await pool.query('COMMIT');
    res.json({ success: true });
  } catch (err) {
    await pool.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  }
});

// POST /api/working-hours/complete-onboarding — marca onboarding como concluído
router.post('/complete-onboarding', auth, async (req, res) => {
  try {
    const slug = req.body.slug || req.user.business_name
      ?.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    await pool.query(
      'UPDATE users SET onboarding_completed = TRUE, booking_slug = $1 WHERE id = $2',
      [slug, req.userId]
    );
    res.json({ success: true, slug });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/working-hours/available-slots?date=2026-03-10&service_id=xxx&user_id=xxx
// Rota pública — retorna horários disponíveis para o bot/booking page
router.get('/available-slots', async (req, res) => {
  const { date, service_id, user_id } = req.query;
  if (!date || !service_id || !user_id) {
    return res.status(400).json({ error: 'date, service_id e user_id são obrigatórios' });
  }
  try {
    const dayOfWeek = new Date(date + 'T12:00:00').getDay();

    // Busca horário de funcionamento do dia
    const { rows: [wh] } = await pool.query(
      'SELECT * FROM working_hours WHERE user_id = $1 AND day_of_week = $2 AND is_open = TRUE',
      [user_id, dayOfWeek]
    );
    if (!wh) return res.json({ slots: [] });

    // Busca duração do serviço
    const { rows: [service] } = await pool.query(
      'SELECT duration_minutes FROM services WHERE id = $1 AND user_id = $2',
      [service_id, user_id]
    );
    if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });

    // Busca agendamentos existentes no dia
    const { rows: existing } = await pool.query(`
      SELECT start_time, end_time FROM appointments
      WHERE user_id = $1
        AND DATE(start_time AT TIME ZONE 'America/Sao_Paulo') = $2
        AND status NOT IN ('cancelled')
    `, [user_id, date]);

    // Gera slots disponíveis
    const slots = [];
    const [startH, startM] = wh.start_time.split(':').map(Number);
    const [endH, endM] = wh.end_time.split(':').map(Number);
    const duration = service.duration_minutes;

    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current + duration <= end) {
      const slotStart = `${String(Math.floor(current / 60)).padStart(2, '0')}:${String(current % 60).padStart(2, '0')}`;
      const slotEnd = current + duration;
      const slotEndStr = `${String(Math.floor(slotEnd / 60)).padStart(2, '0')}:${String(slotEnd % 60).padStart(2, '0')}`;

      // Verifica intervalo de almoço
      let inLunch = false;
      if (wh.lunch_start && wh.lunch_end) {
        const [lsH, lsM] = wh.lunch_start.split(':').map(Number);
        const [leH, leM] = wh.lunch_end.split(':').map(Number);
        const ls = lsH * 60 + lsM;
        const le = leH * 60 + leM;
        if (current < le && current + duration > ls) inLunch = true;
      }

      // Verifica conflito com agendamentos existentes
      const hasConflict = existing.some(appt => {
        const apptStart = new Date(appt.start_time);
        const apptEnd = new Date(appt.end_time);
        const slotStartDt = new Date(`${date}T${slotStart}:00-03:00`);
        const slotEndDt = new Date(`${date}T${slotEndStr}:00-03:00`);
        return slotStartDt < apptEnd && slotEndDt > apptStart;
      });

      if (!inLunch && !hasConflict) {
        slots.push(slotStart);
      }

      current += 30; // incrementa de 30 em 30 min
    }

    res.json({ slots, date, day_of_week: dayOfWeek });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
