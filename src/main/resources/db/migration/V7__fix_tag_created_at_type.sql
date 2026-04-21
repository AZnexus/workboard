-- Fix tag table: change created_at from TEXT to TIMESTAMP
-- SQLite cannot ALTER COLUMN, so recreate the table

CREATE TABLE tag_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6B7280',
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now'))
);

INSERT INTO tag_new (id, name, color, created_at)
SELECT id, name, color,
  CASE
    WHEN created_at GLOB '[0-9]*' THEN datetime(CAST(created_at AS INTEGER) / 1000, 'unixepoch')
    ELSE created_at
  END
FROM tag;

-- Preserve foreign key references from entry_tag
DROP TABLE tag;
ALTER TABLE tag_new RENAME TO tag;
