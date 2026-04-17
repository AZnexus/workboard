package com.workboard.timelog;

import com.workboard.entry.EntryEntity;
import jakarta.persistence.*;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "time_log")
@EntityListeners(AuditingEntityListener.class)
public class TimeLogEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "INTEGER")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "entry_id")
    private EntryEntity entry;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal hours;

    @Column(nullable = false, length = 100)
    private String project;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "task_code", length = 50)
    private String taskCode;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public EntryEntity getEntry() { return entry; }
    public void setEntry(EntryEntity entry) { this.entry = entry; }
    public LocalDate getDate() { return date; }
    public void setDate(LocalDate date) { this.date = date; }
    public BigDecimal getHours() { return hours; }
    public void setHours(BigDecimal hours) { this.hours = hours; }
    public String getProject() { return project; }
    public void setProject(String project) { this.project = project; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getTaskCode() { return taskCode; }
    public void setTaskCode(String taskCode) { this.taskCode = taskCode; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
