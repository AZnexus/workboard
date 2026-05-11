ALTER TABLE entry ADD COLUMN version_id INTEGER REFERENCES version(id);
