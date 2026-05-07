/**
 * routes/contacts.js
 * All READ  operations  → readerPool
 * All WRITE operations  → writerPool
 */

const express  = require('express');
const { body, param, query, validationResult } = require('express-validator');
const { writerPool, readerPool } = require('../db');

const router = express.Router();

// ── Validation middleware ────────────────────────────────────────────────────
const handleValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ success: false, errors: errors.array() });
  next();
};

const contactValidators = [
  body('first_name').trim().notEmpty().withMessage('First name is required'),
  body('last_name').trim().notEmpty().withMessage('Last name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('job_title').optional().trim(),
  body('status').optional().isIn(['lead','prospect','customer','churned']),
  body('notes').optional().trim(),
  body('avatar_color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
];

// ── GET /contacts ────────────────────────────────────────────────────────────
router.get('/', [
  query('search').optional().trim(),
  query('status').optional().isIn(['lead','prospect','customer','churned','']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
], handleValidation, async (req, res) => {
  try {
    const { search = '', status = '', page = 1, limit = 20 } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let where  = [];
    let params = [];

    if (search) {
      where.push(`(first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company LIKE ?)`);
      const s = `%${search}%`;
      params.push(s, s, s, s);
    }
    if (status) {
      where.push(`status = ?`);
      params.push(status);
    }

    const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

    // Use READER for both count + list
    const [[{ total }]] = await readerPool.execute(
      `SELECT COUNT(*) as total FROM contacts ${whereClause}`,
      params
    );

    const [rows] = await readerPool.execute(
      `SELECT * FROM contacts ${whereClause}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), offset]
    );

    res.json({
      success: true,
      data: rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error('[GET /contacts]', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// ── GET /contacts/stats ──────────────────────────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [rows] = await readerPool.execute(
      `SELECT
        COUNT(*) AS total,
        SUM(status = 'lead')      AS leads,
        SUM(status = 'prospect')  AS prospects,
        SUM(status = 'customer')  AS customers,
        SUM(status = 'churned')   AS churned
       FROM contacts`
    );
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[GET /contacts/stats]', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// ── GET /contacts/:id ────────────────────────────────────────────────────────
router.get('/:id', [
  param('id').isInt({ min: 1 }),
], handleValidation, async (req, res) => {
  try {
    const [rows] = await readerPool.execute(
      `SELECT * FROM contacts WHERE id = ?`,
      [req.params.id]
    );
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    console.error('[GET /contacts/:id]', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// ── POST /contacts ───────────────────────────────────────────────────────────
router.post('/', contactValidators, handleValidation, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, company, job_title, status, notes, avatar_color } = req.body;

    const colors = ['#F59E0B','#10B981','#3B82F6','#8B5CF6','#EF4444','#EC4899','#06B6D4'];
    const color  = avatar_color || colors[Math.floor(Math.random() * colors.length)];

    // Use WRITER for INSERT
    const [result] = await writerPool.execute(
      `INSERT INTO contacts (first_name, last_name, email, phone, company, job_title, status, notes, avatar_color)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone || null, company || null, job_title || null,
       status || 'lead', notes || null, color]
    );

    res.status(201).json({
      success: true,
      data: { id: result.insertId, first_name, last_name, email },
      message: 'Contact created',
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Email already exists' });
    console.error('[POST /contacts]', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// ── PUT /contacts/:id ────────────────────────────────────────────────────────
router.put('/:id', [
  param('id').isInt({ min: 1 }),
  ...contactValidators,
], handleValidation, async (req, res) => {
  try {
    const { first_name, last_name, email, phone, company, job_title, status, notes, avatar_color } = req.body;

    // Use WRITER for UPDATE
    const [result] = await writerPool.execute(
      `UPDATE contacts SET
         first_name=?, last_name=?, email=?, phone=?, company=?,
         job_title=?, status=?, notes=?, avatar_color=?
       WHERE id = ?`,
      [first_name, last_name, email, phone || null, company || null,
       job_title || null, status || 'lead', notes || null,
       avatar_color || '#F59E0B', req.params.id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Contact not found' });

    res.json({ success: true, message: 'Contact updated' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(409).json({ success: false, message: 'Email already exists' });
    console.error('[PUT /contacts/:id]', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// ── DELETE /contacts/:id ─────────────────────────────────────────────────────
router.delete('/:id', [
  param('id').isInt({ min: 1 }),
], handleValidation, async (req, res) => {
  try {
    // Use WRITER for DELETE
    const [result] = await writerPool.execute(
      `DELETE FROM contacts WHERE id = ?`,
      [req.params.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ success: false, message: 'Contact not found' });
    res.json({ success: true, message: 'Contact deleted' });
  } catch (err) {
    console.error('[DELETE /contacts/:id]', err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

module.exports = router;
