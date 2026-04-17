package com.workboard.timelog;

import com.workboard.entry.EntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class TimeLogService {

    private final TimeLogRepository timeLogRepository;
    private final EntryRepository entryRepository;

    public TimeLogService(TimeLogRepository timeLogRepository, EntryRepository entryRepository) {
        this.timeLogRepository = timeLogRepository;
        this.entryRepository = entryRepository;
    }

    @Transactional(readOnly = true)
    public List<TimeLogEntity> findByDate(LocalDate date) {
        return timeLogRepository.findByDate(date);
    }

    @Transactional(readOnly = true)
    public List<TimeLogEntity> findByDateRange(LocalDate from, LocalDate to) {
        return timeLogRepository.findByDateBetween(from, to);
    }

    @Transactional(readOnly = true)
    public TimeLogEntity findById(Long id) {
        return timeLogRepository.findById(id)
                .orElseThrow(() -> new TimeLogNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public List<String> findDistinctProjects() {
        return timeLogRepository.findDistinctProjects();
    }

    @Transactional
    public TimeLogEntity create(CreateTimeLogRequest request) {
        TimeLogEntity entity = new TimeLogEntity();
        entity.setDate(request.date());
        entity.setHours(request.hours());
        entity.setProject(request.project());
        entity.setDescription(request.description());
        entity.setTaskCode(request.taskCode());

        if (request.entryId() != null) {
            entryRepository.findById(request.entryId())
                    .ifPresent(entity::setEntry);
        }

        return timeLogRepository.save(entity);
    }

    @Transactional
    public TimeLogEntity update(Long id, UpdateTimeLogRequest request) {
        TimeLogEntity entity = findById(id);

        if (request.date() != null) entity.setDate(request.date());
        if (request.hours() != null) entity.setHours(request.hours());
        if (request.project() != null) entity.setProject(request.project());
        if (request.description() != null) entity.setDescription(request.description());
        if (request.taskCode() != null) entity.setTaskCode(request.taskCode());
        if (request.entryId() != null) {
            entryRepository.findById(request.entryId())
                    .ifPresent(entity::setEntry);
        }

        return timeLogRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        if (!timeLogRepository.existsById(id)) {
            throw new TimeLogNotFoundException(id);
        }
        timeLogRepository.deleteById(id);
    }
}
