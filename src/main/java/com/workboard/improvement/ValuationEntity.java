package com.workboard.improvement;

import com.workboard.version.VersionEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;

@Entity
@Table(name = "improvement_valuation")
@EntityListeners(AuditingEntityListener.class)
public class ValuationEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "INTEGER")
    private Long id;

    @OneToOne
    @JoinColumn(name = "improvement_id", nullable = false, unique = true)
    private ImprovementEntity improvement;

    @Column(name = "derived_title", nullable = false, length = 255)
    private String derivedTitle;

    @Column(name = "redmine_child_ref", nullable = false, length = 100)
    private String redmineChildRef;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ValuationStatus status = ValuationStatus.NO_COMENCADA;

    @Column(name = "completion_percentage", nullable = false)
    private int completionPercentage = 0;

    @Column
    private Integer priority;

    @ManyToOne
    @JoinColumn(name = "version_id")
    private VersionEntity version;

    @Column(name = "textile_body", columnDefinition = "TEXT")
    private String textileBody;

    @Column(name = "structured_content_json", columnDefinition = "TEXT")
    private String structuredContentJson;

    @Column(name = "analysis_hours")
    private Double analysisHours;

    @Column(name = "total_estimated_hours")
    private Double totalEstimatedHours;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public ImprovementEntity getImprovement() {
        return improvement;
    }

    public void setImprovement(ImprovementEntity improvement) {
        this.improvement = improvement;
    }

    public String getDerivedTitle() {
        return derivedTitle;
    }

    public void setDerivedTitle(String derivedTitle) {
        this.derivedTitle = derivedTitle;
    }

    public String getRedmineChildRef() {
        return redmineChildRef;
    }

    public void setRedmineChildRef(String redmineChildRef) {
        this.redmineChildRef = redmineChildRef;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public ValuationStatus getStatus() {
        return status;
    }

    public void setStatus(ValuationStatus status) {
        this.status = status;
    }

    public int getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(int completionPercentage) {
        this.completionPercentage = completionPercentage;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public VersionEntity getVersion() {
        return version;
    }

    public void setVersion(VersionEntity version) {
        this.version = version;
    }

    public String getTextileBody() {
        return textileBody;
    }

    public void setTextileBody(String textileBody) {
        this.textileBody = textileBody;
    }

    public String getStructuredContentJson() {
        return structuredContentJson;
    }

    public void setStructuredContentJson(String structuredContentJson) {
        this.structuredContentJson = structuredContentJson;
    }

    public Double getAnalysisHours() {
        return analysisHours;
    }

    public void setAnalysisHours(Double analysisHours) {
        this.analysisHours = analysisHours;
    }

    public Double getTotalEstimatedHours() {
        return totalEstimatedHours;
    }

    public void setTotalEstimatedHours(Double totalEstimatedHours) {
        this.totalEstimatedHours = totalEstimatedHours;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
}
