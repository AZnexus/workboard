CREATE TABLE entry (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    body TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    date DATE NOT NULL DEFAULT (date('now')),
    external_ref VARCHAR(100),
    pinned BOOLEAN NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    updated_at TIMESTAMP NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_entry_date ON entry(date);
CREATE INDEX idx_entry_type ON entry(type);
CREATE INDEX idx_entry_status ON entry(status);
