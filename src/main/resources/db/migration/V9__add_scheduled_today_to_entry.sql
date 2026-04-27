ALTER TABLE entry ADD COLUMN scheduled_today BOOLEAN NOT NULL DEFAULT 0;

UPDATE entry
SET scheduled_today = 1
WHERE type = 'TASK'
  AND status IN ('OPEN', 'IN_PROGRESS', 'PAUSED')
  AND due_date = date('now', 'localtime');
