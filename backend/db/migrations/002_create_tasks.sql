-- 002_create_tasks.sql
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  due_date TEXT,     -- ISO date string
  priority INTEGER NOT NULL CHECK (priority >= 1 AND priority <= 5),
  notes TEXT
);
