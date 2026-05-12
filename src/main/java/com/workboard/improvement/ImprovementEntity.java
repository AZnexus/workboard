package com.workboard.improvement;

import com.workboard.tag.TagEntity;
import com.workboard.version.VersionEntity;
import jakarta.persistence.CascadeType;
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
import jakarta.persistence.OneToMany;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "improvement")
@EntityListeners(AuditingEntityListener.class)
public class ImprovementEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(columnDefinition = "INTEGER")
    private Long id;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String requirements;

    @Column(name = "redmine_parent_ref", length = 100)
    private String redmineParentRef;

    @Column
    private Integer priority;

    @Column(name = "due_date")
    private LocalDate dueDate;

    @Column(name = "jira_ref", unique = true, length = 100)
    private String jiraRef;

    @ManyToOne
    @JoinColumn(name = "version_id")
    private VersionEntity version;

    @Column(name = "note_context", columnDefinition = "TEXT")
    private String noteContext;

    @Column(name = "note_risk_dependency", columnDefinition = "TEXT")
    private String noteRiskDependency;

    @Column(name = "note_observations", columnDefinition = "TEXT")
    private String noteObservations;

    @Column(name = "sold_hours")
    private Double soldHours;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ImprovementStatus status = ImprovementStatus.NOVA;

    @Column(name = "completion_percentage", nullable = false)
    private int completionPercentage = 0;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @OneToMany(mappedBy = "improvement", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ImprovementTagEntity> tags = new ArrayList<>();

    @OneToOne(mappedBy = "improvement", cascade = CascadeType.ALL, orphanRemoval = true)
    private ValuationEntity valuation;

    public void addTag(TagEntity tag) {
        ImprovementTagEntity tagEntity = new ImprovementTagEntity();
        tagEntity.setImprovement(this);
        tagEntity.setTagEntity(tag);
        tagEntity.setTag(tag.getName());
        this.tags.add(tagEntity);
    }

    public void clearTags() {
        this.tags.clear();
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getRequirements() {
        return requirements;
    }

    public void setRequirements(String requirements) {
        this.requirements = requirements;
    }

    public String getRedmineParentRef() {
        return redmineParentRef;
    }

    public void setRedmineParentRef(String redmineParentRef) {
        this.redmineParentRef = redmineParentRef;
    }

    public Integer getPriority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public LocalDate getDueDate() {
        return dueDate;
    }

    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
    }

    public String getJiraRef() {
        return jiraRef;
    }

    public void setJiraRef(String jiraRef) {
        this.jiraRef = jiraRef;
    }

    public VersionEntity getVersion() {
        return version;
    }

    public void setVersion(VersionEntity version) {
        this.version = version;
    }

    public String getNoteContext() {
        return noteContext;
    }

    public void setNoteContext(String noteContext) {
        this.noteContext = noteContext;
    }

    public String getNoteRiskDependency() {
        return noteRiskDependency;
    }

    public void setNoteRiskDependency(String noteRiskDependency) {
        this.noteRiskDependency = noteRiskDependency;
    }

    public String getNoteObservations() {
        return noteObservations;
    }

    public void setNoteObservations(String noteObservations) {
        this.noteObservations = noteObservations;
    }

    public Double getSoldHours() {
        return soldHours;
    }

    public void setSoldHours(Double soldHours) {
        this.soldHours = soldHours;
    }

    public ImprovementStatus getStatus() {
        return status;
    }

    public void setStatus(ImprovementStatus status) {
        this.status = status;
    }

    public int getCompletionPercentage() {
        return completionPercentage;
    }

    public void setCompletionPercentage(int completionPercentage) {
        this.completionPercentage = completionPercentage;
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

    public List<ImprovementTagEntity> getTags() {
        return tags;
    }

    public void setTags(List<ImprovementTagEntity> tags) {
        this.tags = tags;
    }

    public ValuationEntity getValuation() {
        return valuation;
    }

    public void setValuation(ValuationEntity valuation) {
        this.valuation = valuation;
    }
}
