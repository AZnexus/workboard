CREATE TABLE time_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER,
    date DATE NOT NULL,
    hours DECIMAL(4,2) NOT NULL,
    project VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (entry_id) REFERENCES entry(id) ON DELETE SET NULL
);

CREATE INDEX idx_timelog_date ON time_log(date);
