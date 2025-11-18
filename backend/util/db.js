// util/db.js
const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'db', 'sqlite.db');
const MIGRATIONS_DIR = path.join(__dirname, '..', 'db', 'migrations');

function ensureDb() {
  const db = new Database(DB_PATH);
  // create a simple migrations tracking table
  db.exec(`
    CREATE TABLE IF NOT EXISTS migrations_applied (
      name TEXT PRIMARY KEY,
      applied_at TEXT
    );
  `);
  return db;
}

function applyMigrations() {
  const db = ensureDb();
  const files = fs.readdirSync(MIGRATIONS_DIR).filter(f => f.endsWith('.sql')).sort();
  for (const f of files) {
    const exists = db.prepare('SELECT 1 FROM migrations_applied WHERE name = ?').get(f);
    if (!exists) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, f), 'utf8');
      db.exec('BEGIN');
      try {
        db.exec(sql);
        db.prepare('INSERT INTO migrations_applied(name, applied_at) VALUES (?, ?)').run(f, new Date().toISOString());
        db.exec('COMMIT');
        console.log('Applied migration', f);
      } catch (err) {
        db.exec('ROLLBACK');
        console.error('Failed migration', f, err);
        throw err;
      }
    } else {
      console.log('Skipping already applied migration', f);
    }
  }
  db.close();
}

module.exports = { ensureDb, applyMigrations, DB_PATH };
