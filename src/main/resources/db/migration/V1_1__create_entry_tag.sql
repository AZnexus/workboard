CREATE TABLE entry_tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    tag VARCHAR(50) NOT NULL,
    FOREIGN KEY (entry_id) REFERENCES entry(id) ON DELETE CASCADE,
    UNIQUE(entry_id, tag)
);

CREATE INDEX idx_entry_tag_tag ON entry_tag(tag);
CREATE INDEX idx_entry_tag_entry ON entry_tag(entry_id);
