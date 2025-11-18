// routes/books.js
const express = require('express');
const { body, param, validationResult } = require('express-validator');
const router = express.Router();
const { ensureDb } = require('../util/db');

function getDb() { return ensureDb(); }

router.get('/', (req, res) => {
  const db = getDb();
  const rows = db.prepare('SELECT * FROM books ORDER BY id DESC').all();
  db.close();
  res.json(rows);
});

router.get('/:id', [ param('id').isInt() ], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const db = getDb();
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  db.close();
  if (!book) return res.status(404).json({ message: 'Book not found' });
  res.json(book);
});

router.post('/', [
  body('title').isLength({ min: 3 }),
  body('pages').isInt({ gt: 0 }),
  body('author').isLength({ min: 3 }),
  body('published_at').optional().isISO8601(),
  body('rating').optional().isInt({ min: 1, max: 10 }),
  body('isbn').optional().isLength({ min: 10, max: 20 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const db = getDb();
  const stmt = db.prepare('INSERT INTO books (title,pages,published_at,author,rating,isbn) VALUES (?,?,?,?,?,?)');
  const info = stmt.run(req.body.title, req.body.pages, req.body.published_at || null, req.body.author, req.body.rating || null, req.body.isbn || null);
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(info.lastInsertRowid);
  db.close();
  res.status(201).json(book);
});

router.put('/:id', [
  param('id').isInt(),
  body('title').isLength({ min: 3 }),
  body('pages').isInt({ gt: 0 }),
  body('author').isLength({ min: 3 }),
  body('published_at').optional().isISO8601(),
  body('rating').optional().isInt({ min: 1, max: 10 }),
  body('isbn').optional().isLength({ min: 10, max: 20 })
], (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const db = getDb();
  const existing = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  if (!existing) { db.close(); return res.status(404).json({ message: 'Book not found' }); }
  const stmt = db.prepare('UPDATE books SET title=?,pages=?,published_at=?,author=?,rating=?,isbn=? WHERE id=?');
  stmt.run(req.body.title, req.body.pages, req.body.published_at || null, req.body.author, req.body.rating || null, req.body.isbn || null, req.params.id);
  const updated = db.prepare('SELECT * FROM books WHERE id = ?').get(req.params.id);
  db.close();
  res.json(updated);
});

router.delete('/:id', [ param('id').isInt() ], (req, res) => {
  const db = getDb();
  const info = db.prepare('DELETE FROM books WHERE id = ?').run(req.params.id);
  db.close();
  if (info.changes === 0) return res.status(404).json({ message: 'Book not found' });
  res.status(204).send();
});

module.exports = router;
