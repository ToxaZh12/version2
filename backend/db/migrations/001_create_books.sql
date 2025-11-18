-- 001_create_books.sql
CREATE TABLE IF NOT EXISTS books (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  pages INTEGER NOT NULL CHECK (pages > 0),
  published_at TEXT, -- ISO date string
  author TEXT NOT NULL
);
