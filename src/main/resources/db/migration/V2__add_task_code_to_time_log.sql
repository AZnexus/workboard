ALTER TABLE time_log ADD COLUMN task_code VARCHAR(50);

CREATE INDEX idx_timelog_task_code ON time_log(task_code);
