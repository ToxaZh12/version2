-- 003_add_book_fields_from_partner.sql
-- Миграция B: добавляем 2 поля к books (например: rating, isbn)
ALTER TABLE books ADD COLUMN rating INTEGER DEFAULT NULL; -- 1..10
ALTER TABLE books ADD COLUMN isbn TEXT DEFAULT NULL; -- 13 chars suggested
