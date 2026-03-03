const pool = require('../config/database');
const { sendWhatsAppMessage, buildConfirmationMessage } = require('../utils/whatsapp');

const WHATSAPP_ENABLED = process.env.WHATSAPP_ENABLED === 'true';

// ── GET /appointments ─────────────────────────
const getAll = async (req, res) => {
  const { start, end, status } = req.query;
  try {
    let query = `
      SELECT a.*,
             c.name as client_name, c.phone as client_phone,
             s.name as service_name, s.color as service_color, s.duration_minutes
      FROM appointments a
      JOIN clients c ON c.id = a.client_id
      JOIN services s ON s.id = a.service_id
      WHERE a.user_id = $1
    `;
    const params = [req.userId];
    let idx = 2;
    if (start)  { query += ` AND a.start_time >= $${idx++}`; params.push(start); }
    if (end)    { query += ` AND a.start_time <= $${idx++}`; params.push(end); }
    if (status) { query += ` AND a.status = $${idx++}`; params.push(status); }
    query += ' ORDER BY a.start_time ASC';
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ── GET /appointments/:id ─────────────────────
const getOne = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT a.*, c.name as client_name, c.phone as client_phone, c.email as client_email,
              s.name as service_name, s.color as service_color
       FROM appointments a
       JOIN clients c ON c.id = a.client_id
       JOIN services s ON s.id = a.service_id
       WHERE a.id = $1 AND a.user_id = $2`,
      [req.params.id, req.userId]
    );
    if (!rows[0]) return res.status(404).json({ error: 'Agendamento não encontrado' });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ── POST /appointments ────────────────────────
const create = async (req, res) => {
  const { client_id, service_id, start_time, notes } = req.body;
  try {
    // Busca serviço
    const { rows: [service] } = await pool.query(
      'SELECT * FROM services WHERE id = $1 AND user_id = $2',
      [service_id, req.userId]
    );
    if (!service) return res.status(404).json({ error: 'Serviço não encontrado' });

    // Calcula horário fim
    const start = new Date(start_time + (
      start_time.includes('T') && !start_time.includes('Z') && !start_time.includes('+')
        ? '-03:00' : ''
    ));
    const end = new Date(start.getTime() + service.duration_minutes * 60000);

    // Verifica conflito
    const { rows: conflicts } = await pool.query(
      `SELECT id FROM appointments
       WHERE user_id = $1 AND status NOT IN ('cancelled')
       AND (start_time < $2 AND end_time > $3)`,
      [req.userId, end.toISOString(), start.toISOString()]
    );
    if (conflicts.length > 0) {
      return res.status(409).json({ error: 'Conflito de horário: já existe um agendamento nesse período' });
    }

    // Cria agendamento
    const { rows: [appointment] } = await pool.query(
      `INSERT INTO appointments (user_id, client_id, service_id, start_time, end_time, notes, price_charged)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.userId, client_id, service_id, start.toISOString(), end.toISOString(), notes, service.price]
    );

    // Envia WhatsApp se habilitado
    if (WHATSAPP_ENABLED) {
      const [{ rows: [client] }, { rows: [user] }] = await Promise.all([
        pool.query('SELECT * FROM clients WHERE id = $1', [client_id]),
        pool.query('SELECT name, whatsapp_token, whatsapp_phone_id FROM users WHERE id = $1', [req.userId]),
      ]);
      if (client?.phone) {
        const message = buildConfirmationMessage({
          professionalName: user.name,
          clientName: client.name,
          serviceName: service.name,
          startTime: start,
          price: service.price,
        });
        const waResult = await sendWhatsAppMessage(client.phone, message, {
          token: user.whatsapp_token,
          phoneNumberId: user.whatsapp_phone_id,
        });
        if (waResult.success) {
          await pool.query('UPDATE appointments SET whatsapp_sent = true WHERE id = $1', [appointment.id]);
        }
      }
    }

    res.status(201).json(appointment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ── PATCH /appointments/:id/status ───────────
const updateStatus = async (req, res) => {
  const { status, notes } = req.body;
  const validStatuses = ['pending', 'confirmed', 'cancelled', 'completed'];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status inválido' });
  }
  try {
    const { rows: [appt] } = await pool.query(
      `UPDATE appointments SET status=$1, notes=COALESCE($2, notes)
       WHERE id=$3 AND user_id=$4 RETURNING *`,
      [status, notes, req.params.id, req.userId]
    );
    if (!appt) return res.status(404).json({ error: 'Agendamento não encontrado' });
    res.json(appt);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ── DELETE /appointments/:id ──────────────────
const remove = async (req, res) => {
  try {
    const { rows: [appt] } = await pool.query(
      'DELETE FROM appointments WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (!appt) return res.status(404).json({ error: 'Agendamento não encontrado' });
    res.json({ message: 'Agendamento removido' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ── GET /appointments/report ──────────────────
const getReport = async (req, res) => {
  const y = parseInt(req.query.year) || new Date().getFullYear();
  const m = parseInt(req.query.month) || new Date().getMonth() + 1;
  try {
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const [summary, byService, daily] = await Promise.all([
      pool.query(
        `SELECT
           COUNT(*) FILTER (WHERE status = 'completed') as total_completed,
           COUNT(*) FILTER (WHERE status = 'cancelled') as total_cancelled,
           COUNT(*) FILTER (WHERE status = 'pending') as total_pending,
           COUNT(*) FILTER (WHERE status = 'confirmed') as total_confirmed,
           COALESCE(SUM(price_charged) FILTER (WHERE status = 'completed'), 0) as total_revenue,
           COUNT(DISTINCT client_id) as unique_clients
         FROM appointments
         WHERE user_id = $1 AND start_time BETWEEN $2 AND $3`,
        [req.userId, startDate, endDate]
      ),
      pool.query(
        `SELECT s.name, s.color,
                COUNT(*) FILTER (WHERE a.status = 'completed') as count,
                COALESCE(SUM(a.price_charged) FILTER (WHERE a.status = 'completed'), 0) as revenue
         FROM appointments a
         JOIN services s ON s.id = a.service_id
         WHERE a.user_id = $1 AND a.start_time BETWEEN $2 AND $3
         GROUP BY s.id, s.name, s.color
         ORDER BY revenue DESC`,
        [req.userId, startDate, endDate]
      ),
      pool.query(
        `SELECT DATE(start_time) as day,
                COUNT(*) as appointments,
                COALESCE(SUM(price_charged), 0) as revenue
         FROM appointments
         WHERE user_id = $1 AND start_time BETWEEN $2 AND $3 AND status = 'completed'
         GROUP BY DATE(start_time) ORDER BY day`,
        [req.userId, startDate, endDate]
      ),
    ]);

    res.json({
      summary: summary.rows[0],
      by_service: byService.rows,
      daily: daily.rows,
      period: { year: y, month: m },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

// ── GET /appointments/dashboard ───────────────
const getDashboard = async (req, res) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  try {
    const [todayAppts, monthStats, upcoming] = await Promise.all([
      pool.query(
        `SELECT a.*, c.name as client_name, s.name as service_name, s.color as service_color
         FROM appointments a
         JOIN clients c ON c.id = a.client_id
         JOIN services s ON s.id = a.service_id
         WHERE a.user_id = $1 AND a.start_time BETWEEN $2 AND $3
         ORDER BY a.start_time ASC`,
        [req.userId, startOfDay, endOfDay]
      ),
      pool.query(
        `SELECT COUNT(*) FILTER (WHERE status = 'completed') as completed,
                COALESCE(SUM(price_charged) FILTER (WHERE status = 'completed'), 0) as revenue
         FROM appointments
         WHERE user_id = $1 AND DATE_TRUNC('month', start_time) = DATE_TRUNC('month', NOW())`,
        [req.userId]
      ),
      pool.query(
        `SELECT a.*, c.name as client_name, s.name as service_name
         FROM appointments a
         JOIN clients c ON c.id = a.client_id
         JOIN services s ON s.id = a.service_id
         WHERE a.user_id = $1 AND a.start_time > NOW() AND a.status NOT IN ('cancelled')
         ORDER BY a.start_time ASC LIMIT 5`,
        [req.userId]
      ),
    ]);

    res.json({
      today: todayAppts.rows,
      month_stats: monthStats.rows[0],
      upcoming: upcoming.rows,
    });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = { getAll, getOne, create, updateStatus, remove, getReport, getDashboard };
