package com.workboard.entry;

import com.fasterxml.jackson.annotation.JsonSetter;

import java.time.LocalDate;
import java.util.List;

public class UpdateEntryRequest {

    private EntryType type;
    private String title;
    private String body;
    private EntryStatus status;
    private LocalDate date;
    private LocalDate dueDate;
    private Boolean scheduledToday;
    private List<Long> tagIds;
    private String externalRef;
    private Boolean pinned;
    private Integer priority;
    private Long versionId;
    private Long improvementId;
    private boolean dueDateProvided;
    private boolean scheduledTodayProvided;
    private boolean versionIdProvided;
    private boolean improvementIdProvided;

    public UpdateEntryRequest() {
    }

    public UpdateEntryRequest(
            EntryType type,
            String title,
            String body,
            EntryStatus status,
            LocalDate date,
            LocalDate dueDate,
            Boolean scheduledToday,
            List<Long> tagIds,
            String externalRef,
            Boolean pinned,
            Integer priority,
            Long versionId
    ) {
        this(type, title, body, status, date, dueDate, scheduledToday, tagIds, externalRef, pinned, priority, versionId, null, false, false, false, false);
    }

    public UpdateEntryRequest(
            EntryType type,
            String title,
            String body,
            EntryStatus status,
            LocalDate date,
            LocalDate dueDate,
            Boolean scheduledToday,
            List<Long> tagIds,
            String externalRef,
            Boolean pinned,
            Integer priority,
            Long versionId,
            boolean dueDateProvided,
            boolean scheduledTodayProvided,
            boolean versionIdProvided
    ) {
        this(type, title, body, status, date, dueDate, scheduledToday, tagIds, externalRef, pinned, priority, versionId, null,
                dueDateProvided, scheduledTodayProvided, versionIdProvided, false);
    }

    public UpdateEntryRequest(
            EntryType type,
            String title,
            String body,
            EntryStatus status,
            LocalDate date,
            LocalDate dueDate,
            Boolean scheduledToday,
            List<Long> tagIds,
            String externalRef,
            Boolean pinned,
            Integer priority,
            Long versionId,
            Long improvementId,
            boolean dueDateProvided,
            boolean scheduledTodayProvided,
            boolean versionIdProvided,
            boolean improvementIdProvided
    ) {
        this.type = type;
        this.title = title;
        this.body = body;
        this.status = status;
        this.date = date;
        this.dueDate = dueDate;
        this.scheduledToday = scheduledToday;
        this.tagIds = tagIds;
        this.externalRef = externalRef;
        this.pinned = pinned;
        this.priority = priority;
        this.versionId = versionId;
        this.improvementId = improvementId;
        this.dueDateProvided = dueDateProvided;
        this.scheduledTodayProvided = scheduledTodayProvided;
        this.versionIdProvided = versionIdProvided;
        this.improvementIdProvided = improvementIdProvided;
    }

    public EntryType type() {
        return type;
    }

    public void setType(EntryType type) {
        this.type = type;
    }

    public String title() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String body() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public EntryStatus status() {
        return status;
    }

    public void setStatus(EntryStatus status) {
        this.status = status;
    }

    public LocalDate date() {
        return date;
    }

    public void setDate(LocalDate date) {
        this.date = date;
    }

    public LocalDate dueDate() {
        return dueDate;
    }

    @JsonSetter("dueDate")
    public void setDueDate(LocalDate dueDate) {
        this.dueDate = dueDate;
        this.dueDateProvided = true;
    }

    public Boolean scheduledToday() {
        return scheduledToday;
    }

    @JsonSetter("scheduledToday")
    public void setScheduledToday(Boolean scheduledToday) {
        this.scheduledToday = scheduledToday;
        this.scheduledTodayProvided = true;
    }

    public List<Long> tagIds() {
        return tagIds;
    }

    public void setTagIds(List<Long> tagIds) {
        this.tagIds = tagIds;
    }

    public String externalRef() {
        return externalRef;
    }

    public void setExternalRef(String externalRef) {
        this.externalRef = externalRef;
    }

    public Boolean pinned() {
        return pinned;
    }

    public void setPinned(Boolean pinned) {
        this.pinned = pinned;
    }

    public Integer priority() {
        return priority;
    }

    public void setPriority(Integer priority) {
        this.priority = priority;
    }

    public Long versionId() {
        return versionId;
    }

    @JsonSetter("versionId")
    public void setVersionId(Long versionId) {
        this.versionId = versionId;
        this.versionIdProvided = true;
    }

    public boolean dueDateProvided() {
        return dueDateProvided;
    }

    public boolean scheduledTodayProvided() {
        return scheduledTodayProvided;
    }

    public boolean versionIdProvided() {
        return versionIdProvided;
    }

    public Long improvementId() {
        return improvementId;
    }

    @JsonSetter("improvementId")
    public void setImprovementId(Long improvementId) {
        this.improvementId = improvementId;
        this.improvementIdProvided = true;
    }

    public boolean improvementIdProvided() {
        return improvementIdProvided;
    }
}
