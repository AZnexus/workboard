package com.workboard.timelog;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface TimeLogRepository extends JpaRepository<TimeLogEntity, Long> {

    List<TimeLogEntity> findByDate(LocalDate date);

    List<TimeLogEntity> findByDateBetween(LocalDate from, LocalDate to);

    List<TimeLogEntity> findByProject(String project);

    List<TimeLogEntity> findByEntryId(Long entryId);

    @Query("SELECT t.project, SUM(t.hours) FROM TimeLogEntity t WHERE t.date BETWEEN :from AND :to GROUP BY t.project")
    List<Object[]> sumHoursByProjectBetween(@Param("from") LocalDate from, @Param("to") LocalDate to);
    @Query("SELECT DISTINCT t.project FROM TimeLogEntity t ORDER BY t.project")
    List<String> findDistinctProjects();
}
