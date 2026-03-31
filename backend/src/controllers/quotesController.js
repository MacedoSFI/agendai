// src/controllers/quotesController.js
const pool = require('../config/database');

// ── TEMPLATES ─────────────────────────────────

// GET /quotes/templates
const getTemplates = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT qt.*,
        COALESCE(json_agg(qti ORDER BY qti.position) FILTER (WHERE qti.id IS NOT NULL), '[]') AS items
      FROM quote_templates qt
      LEFT JOIN quote_template_items qti ON qti.template_id = qt.id
      WHERE qt.user_id = $1
      GROUP BY qt.id
      ORDER BY qt.created_at DESC
    `, [req.userId]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  }
};

// POST /quotes/templates
const createTemplate = async (req, res) => {
  const { name, description, validity_days = 7, items = [] } = req.body;
  if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [tmpl] } = await client.query(`
      INSERT INTO quote_templates (user_id, name, description, validity_days)
      VALUES ($1,$2,$3,$4) RETURNING *
    `, [req.userId, name, description, validity_days]);

    for (let i = 0; i < items.length; i++) {
      const { name: iname, description: idesc, price, quantity = 1, adjustable = false } = items[i];
      await client.query(`
        INSERT INTO quote_template_items (template_id, name, description, price, quantity, adjustable, position)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
      `, [tmpl.id, iname, idesc, price, quantity, adjustable, i]);
    }

    await client.query('COMMIT');
    res.status(201).json(tmpl);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  } finally {
    client.release();
  }
};

// PUT /quotes/templates/:id
const updateTemplate = async (req, res) => {
  const { name, description, validity_days, active, items = [] } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [tmpl] } = await client.query(`
      UPDATE quote_templates SET name=$1, description=$2, validity_days=$3, active=$4, updated_at=NOW()
      WHERE id=$5 AND user_id=$6 RETURNING *
    `, [name, description, validity_days, active, req.params.id, req.userId]);
    if (!tmpl) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Template não encontrado' }); }

    // Recria os itens
    await client.query('DELETE FROM quote_template_items WHERE template_id=$1', [tmpl.id]);
    for (let i = 0; i < items.length; i++) {
      const { name: iname, description: idesc, price, quantity = 1, adjustable = false } = items[i];
      await client.query(`
        INSERT INTO quote_template_items (template_id, name, description, price, quantity, adjustable, position)
        VALUES ($1,$2,$3,$4,$5,$6,$7)
      `, [tmpl.id, iname, idesc, price, quantity, adjustable, i]);
    }

    await client.query('COMMIT');
    res.json(tmpl);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: 'Erro interno' });
  } finally {
    client.release();
  }
};

// DELETE /quotes/templates/:id
const deleteTemplate = async (req, res) => {
  try {
    const { rows: [t] } = await pool.query(
      'DELETE FROM quote_templates WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (!t) return res.status(404).json({ error: 'Template não encontrado' });
    res.json({ message: 'Template removido' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

// ── ORÇAMENTOS ────────────────────────────────

// GET /quotes
const getQuotes = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT q.*,
        qt.name AS template_name,
        COALESCE(json_agg(qi ORDER BY qi.created_at) FILTER (WHERE qi.id IS NOT NULL), '[]') AS items
      FROM quotes q
      LEFT JOIN quote_templates qt ON qt.id = q.template_id
      LEFT JOIN quote_items qi ON qi.quote_id = q.id
      WHERE q.user_id = $1
      GROUP BY q.id, qt.name
      ORDER BY q.created_at DESC
    `, [req.userId]);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

// POST /quotes — cria orçamento (pelo profissional ou via link público)
const createQuote = async (req, res) => {
  const { template_id, client_name, client_phone, client_email, notes, discount = 0, items = [], validity_days = 7 } = req.body;
  const userId = req.userId; // null se público

  if (!items.length) return res.status(400).json({ error: 'Selecione pelo menos um item' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Calcula total
    const total = items.reduce((sum, i) => sum + (parseFloat(i.price) * parseInt(i.quantity || 1)), 0) - parseFloat(discount);

    // Busca user_id pelo template se vier de link público
    let finalUserId = userId;
    if (!finalUserId && template_id) {
      const { rows: [t] } = await client.query('SELECT user_id FROM quote_templates WHERE id=$1', [template_id]);
      if (t) finalUserId = t.user_id;
    }
    if (!finalUserId) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Profissional não identificado' }); }

    const expires_at = new Date(Date.now() + validity_days * 86400000);

    const { rows: [quote] } = await client.query(`
      INSERT INTO quotes (user_id, template_id, client_name, client_phone, client_email, notes, discount, total, status, expires_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,'sent',$9) RETURNING *
    `, [finalUserId, template_id, client_name, client_phone, client_email, notes, discount, Math.max(total, 0), expires_at]);

    for (const item of items) {
      const subtotal = parseFloat(item.price) * parseInt(item.quantity || 1);
      await client.query(`
        INSERT INTO quote_items (quote_id, name, description, price, quantity, subtotal)
        VALUES ($1,$2,$3,$4,$5,$6)
      `, [quote.id, item.name, item.description, item.price, item.quantity || 1, subtotal]);
    }

    await client.query('COMMIT');
    res.status(201).json(quote);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  } finally {
    client.release();
  }
};

// GET /quotes/:id — detalhe do orçamento
const getQuote = async (req, res) => {
  try {
    const { rows: [quote] } = await pool.query(`
      SELECT q.*, qt.name AS template_name,
        COALESCE(json_agg(qi ORDER BY qi.created_at) FILTER (WHERE qi.id IS NOT NULL), '[]') AS items
      FROM quotes q
      LEFT JOIN quote_templates qt ON qt.id = q.template_id
      LEFT JOIN quote_items qi ON qi.quote_id = q.id
      WHERE q.id = $1
      GROUP BY q.id, qt.name
    `, [req.params.id]);
    if (!quote) return res.status(404).json({ error: 'Orçamento não encontrado' });
    res.json(quote);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

// PATCH /quotes/:id/status
const updateStatus = async (req, res) => {
  const { status } = req.body;
  const valid = ['draft','sent','accepted','rejected','converted'];
  if (!valid.includes(status)) return res.status(400).json({ error: 'Status inválido' });
  try {
    const { rows: [q] } = await pool.query(
      'UPDATE quotes SET status=$1, updated_at=NOW() WHERE id=$2 AND user_id=$3 RETURNING *',
      [status, req.params.id, req.userId]
    );
    if (!q) return res.status(404).json({ error: 'Orçamento não encontrado' });
    res.json(q);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

// POST /quotes/:id/convert — converte em agendamento
const convertToAppointment = async (req, res) => {
  const { service_id, start_time } = req.body;
  if (!service_id || !start_time) return res.status(400).json({ error: 'Serviço e horário obrigatórios' });

  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { rows: [quote] } = await client.query(
      'SELECT * FROM quotes WHERE id=$1 AND user_id=$2', [req.params.id, req.userId]
    );
    if (!quote) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Orçamento não encontrado' }); }

    // Busca ou cria cliente
    let clientId;
    if (quote.client_phone) {
      const { rows: [existing] } = await client.query(
        'SELECT id FROM clients WHERE user_id=$1 AND phone=$2', [req.userId, quote.client_phone]
      );
      if (existing) {
        clientId = existing.id;
      } else {
        const { rows: [newClient] } = await client.query(
          'INSERT INTO clients (user_id, name, phone, email) VALUES ($1,$2,$3,$4) RETURNING id',
          [req.userId, quote.client_name, quote.client_phone, quote.client_email]
        );
        clientId = newClient.id;
      }
    }
    if (!clientId) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'Cliente sem telefone cadastrado' }); }

    // Busca serviço
    const { rows: [service] } = await client.query(
      'SELECT * FROM services WHERE id=$1 AND user_id=$2', [service_id, req.userId]
    );
    if (!service) { await client.query('ROLLBACK'); return res.status(404).json({ error: 'Serviço não encontrado' }); }

    const start = new Date(start_time);
    const end   = new Date(start.getTime() + service.duration_minutes * 60000);

    const { rows: [appt] } = await client.query(`
      INSERT INTO appointments (user_id, client_id, service_id, start_time, end_time, status, price_charged, notes)
      VALUES ($1,$2,$3,$4,$5,'confirmed',$6,$7) RETURNING *
    `, [req.userId, clientId, service_id, start, end, quote.total, `Convertido do orçamento #${quote.id.slice(0,8)}`]);

    await client.query(
      'UPDATE quotes SET status=$1, appointment_id=$2, updated_at=NOW() WHERE id=$3',
      ['converted', appt.id, quote.id]
    );

    await client.query('COMMIT');
    res.json({ appointment: appt });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Erro interno' });
  } finally {
    client.release();
  }
};

// GET /public/quote-template/:templateId — link público do template
const getPublicTemplate = async (req, res) => {
  try {
    const { rows: [tmpl] } = await pool.query(`
      SELECT qt.*, u.name AS professional_name, u.business_name,
        COALESCE(json_agg(qti ORDER BY qti.position) FILTER (WHERE qti.id IS NOT NULL), '[]') AS items
      FROM quote_templates qt
      JOIN users u ON u.id = qt.user_id
      LEFT JOIN quote_template_items qti ON qti.template_id = qt.id
      WHERE qt.id = $1 AND qt.active = true
      GROUP BY qt.id, u.name, u.business_name
    `, [req.params.templateId]);
    if (!tmpl) return res.status(404).json({ error: 'Formulário não encontrado' });
    res.json(tmpl);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno' });
  }
};

module.exports = {
  getTemplates, createTemplate, updateTemplate, deleteTemplate,
  getQuotes, createQuote, getQuote, updateStatus, convertToAppointment,
  getPublicTemplate,
};
