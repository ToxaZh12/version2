// routes/tasks.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const { ensureDb } = require('../util/db');

function getDb() { return ensureDb(); }

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM tasks ORDER BY id DESC').all();
  db.close();
  res.json(rows);
});

router.get('/:id', [ param('id').isInt() ], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const db = getDb();
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  db.close();
  if (!task) return res.status(404).json({ message: 'Task not found' });
  res.json(task);
});

router.post('/', [
  body('title').isLength({ min: 3 }),
  body('priority').isInt({ min: 1, max: 5 }),
  body('due_date').optional().isISO8601(),
  body('status').optional().isIn(['todo','in_progress','done']),
  body('estimated_hours').optional().isFloat({ min: 0 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const db = getDb();
  const stmt = db.prepare('INSERT INTO tasks (title,due_date,priority,notes,status,estimated_hours) VALUES (?,?,?,?,?,?)');
  const info = stmt.run(req.body.title, req.body.due_date || null, req.body.priority, req.body.notes || null, req.body.status || 'todo', req.body.estimated_hours || null);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(info.lastInsertRowid);
  db.close();
  res.status(201).json(task);
});

router.put('/:id', [
  param('id').isInt(),
  body('title').isLength({ min: 3 }),
  body('priority').isInt({ min: 1, max: 5 }),
  body('due_date').optional().isISO8601(),
  body('status').optional().isIn(['todo','in_progress','done']),
  body('estimated_hours').optional().isFloat({ min: 0 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const db = getDb();
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) { db.close(); return res.status(404).json({ message: 'Task not found' }); }
  const stmt = db.prepare('UPDATE tasks SET title=?,due_date=?,priority=?,notes=?,status=?,estimated_hours=? WHERE id=?');
  stmt.run(req.body.title, req.body.due_date || null, req.body.priority, req.body.notes || null, req.body.status || 'todo', req.body.estimated_hours || null, req.params.id);
  const updated = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  db.close();
  res.json(updated);
});

router.delete('/:id', [ param('id').isInt() ], (req, res) => {
  const db = getDb();
  const info = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  db.close();
  if (info.changes === 0) return res.status(404).json({ message: 'Task not found' });
  res.status(204).send();
});

module.exports = router;
