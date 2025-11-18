-- 004_add_task_fields_from_partner.sql
-- Миграция B: добавляем 2 поля к tasks (например: status, estimated_hours)
ALTER TABLE tasks ADD COLUMN status TEXT DEFAULT 'todo'; -- todo|in_progress|done
ALTER TABLE tasks ADD COLUMN estimated_hours REAL DEFAULT NULL;
