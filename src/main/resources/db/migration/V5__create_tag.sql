CREATE TABLE tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL DEFAULT '#6B7280',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Migrate existing string tags to tag table
INSERT OR IGNORE INTO tag (name) SELECT DISTINCT tag FROM entry_tag;

-- Add tag_id column to entry_tag
ALTER TABLE entry_tag ADD COLUMN tag_id INTEGER REFERENCES tag(id);

-- Populate tag_id from existing tag strings
UPDATE entry_tag SET tag_id = (SELECT t.id FROM tag t WHERE t.name = entry_tag.tag);
