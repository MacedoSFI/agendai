const pool = require('../config/database');

const getAll = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM services WHERE user_id = $1 ORDER BY name ASC',
      [req.userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const create = async (req, res) => {
  const { name, description, duration_minutes, price, color, payment_message } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO services (user_id, name, description, duration_minutes, price, color, payment_message)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [req.userId, name, description, duration_minutes, price, color || '#6366f1', payment_message || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const update = async (req, res) => {
  const { name, description, duration_minutes, price, color, active, payment_message } = req.body;
  try {
    const result = await pool.query(
      `UPDATE services SET name=$1, description=$2, duration_minutes=$3, price=$4, color=$5, active=$6, payment_message=$7
       WHERE id=$8 AND user_id=$9 RETURNING *`,
      [name, description, duration_minutes, price, color, active, payment_message || null, req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

const remove = async (req, res) => {
  try {
    const result = await pool.query(
      'DELETE FROM services WHERE id=$1 AND user_id=$2 RETURNING id',
      [req.params.id, req.userId]
    );
    if (!result.rows[0]) return res.status(404).json({ error: 'Serviço não encontrado' });
    res.json({ message: 'Serviço removido com sucesso' });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
};

module.exports = { getAll, create, update, remove };
