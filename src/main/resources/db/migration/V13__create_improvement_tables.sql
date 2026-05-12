CREATE TABLE improvement (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    requirements TEXT,
    redmine_parent_ref TEXT,
    priority INTEGER,
    due_date DATE,
    jira_ref TEXT UNIQUE,
    version_id INTEGER REFERENCES version(id),
    note_context TEXT,
    note_risk_dependency TEXT,
    note_observations TEXT,
    sold_hours REAL,
    status TEXT NOT NULL,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE improvement_tag (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    improvement_id INTEGER NOT NULL REFERENCES improvement(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tag(id),
    tag TEXT NOT NULL
);

CREATE TABLE improvement_valuation (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    improvement_id INTEGER NOT NULL UNIQUE REFERENCES improvement(id) ON DELETE CASCADE,
    derived_title TEXT NOT NULL,
    redmine_child_ref TEXT NOT NULL,
    due_date DATE,
    status TEXT NOT NULL,
    completion_percentage INTEGER NOT NULL DEFAULT 0,
    priority INTEGER,
    version_id INTEGER REFERENCES version(id),
    textile_body TEXT,
    structured_content_json TEXT,
    analysis_hours REAL,
    total_estimated_hours REAL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
