package com.workboard.entry;

import com.workboard.improvement.ImprovementEntity;
import com.workboard.improvement.ImprovementService;
import com.workboard.tag.TagEntity;
import com.workboard.tag.TagNotFoundException;
import com.workboard.tag.TagService;
import com.workboard.version.VersionEntity;
import com.workboard.version.VersionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class EntryService {

    private final EntryRepository entryRepository;
    private final TagService tagService;
    private final VersionService versionService;
    private final ImprovementService improvementService;

    public EntryService(EntryRepository entryRepository, TagService tagService, VersionService versionService, ImprovementService improvementService) {
        this.entryRepository = entryRepository;
        this.tagService = tagService;
        this.versionService = versionService;
        this.improvementService = improvementService;
    }

    @Transactional(readOnly = true)
    public Page<EntryEntity> findAll(Pageable pageable) {
        return entryRepository.findAllWithTags(pageable);
    }

    @Transactional(readOnly = true)
    public Page<EntryEntity> findByDate(LocalDate date, Pageable pageable) {
        return entryRepository.findByDate(date, pageable);
    }

    @Transactional(readOnly = true)
    public Page<EntryEntity> search(EntrySearchCriteria criteria, Pageable pageable) {
        return entryRepository.findAllWithTags(EntrySearchSpecifications.fromCriteria(criteria), pageable);
    }

    @Transactional(readOnly = true)
    public EntryEntity findById(Long id) {
        return entryRepository.findByIdWithTags(id)
                .orElseThrow(() -> new EntryNotFoundException(id));
    }

    @Transactional(readOnly = true)
    public Optional<EntryEntity> findOptionalForReference(Long id) {
        return entryRepository.findById(id);
    }

    @Transactional
    public EntryEntity create(CreateEntryRequest request) {
        EntryEntity entry = new EntryEntity();
        entry.setType(request.type());
        entry.setTitle(request.title());
        entry.setBody(request.body());
        entry.setDate(request.date());
        entry.setDueDate(request.dueDate());
        if (request.scheduledToday() != null) {
            entry.setScheduledToday(request.scheduledToday());
        }
        entry.setExternalRef(request.externalRef());
        entry.setPriority(request.priority());
        applyVersion(entry, request.type(), request.versionId(), true);
        applyImprovement(entry, request.type(), request.improvementId(), true);

        if (request.status() != null) {
            entry.setStatus(request.status());
        }

        if (request.tagIds() != null) {
            request.tagIds().forEach(tagId -> {
                TagEntity tagEntity = tagService.findById(tagId);
                entry.addTag(tagEntity);
            });
        }

        return entryRepository.save(entry);
    }

    @Transactional
    public EntryEntity update(Long id, UpdateEntryRequest request) {
        EntryEntity entry = findById(id);

        EntryType finalType = request.type() != null ? request.type() : entry.getType();

        if (request.type() != null) entry.setType(request.type());
        if (request.title() != null) entry.setTitle(request.title());
        if (request.body() != null) entry.setBody(request.body());
        if (request.status() != null) {
            entry.setStatus(request.status());
        }
        if (request.date() != null) entry.setDate(request.date());
        if (request.dueDateProvided()) entry.setDueDate(request.dueDate());
        if (request.scheduledTodayProvided()) entry.setScheduledToday(Boolean.TRUE.equals(request.scheduledToday()));
        if (request.externalRef() != null) entry.setExternalRef(request.externalRef());
        if (request.pinned() != null) entry.setPinned(request.pinned());
        if (request.priority() != null) entry.setPriority(request.priority());
        applyVersion(entry, finalType, request.versionId(), request.versionIdProvided());
        applyImprovement(entry, finalType, request.improvementId(), request.improvementIdProvided());
        if (request.tagIds() != null) {
            entry.clearTags();
            entryRepository.flush();
            request.tagIds().forEach(tagId -> {
                TagEntity tagEntity = tagService.findById(tagId);
                entry.addTag(tagEntity);
            });
        }

        return entryRepository.save(entry);
    }

    @Transactional
    public void delete(Long id) {
        if (!entryRepository.existsById(id)) {
            throw new EntryNotFoundException(id);
        }
        entryRepository.deleteById(id);
    }

    private void applyVersion(EntryEntity entry, EntryType finalType, Long versionId, boolean versionIdProvided) {
        if (finalType != EntryType.TASK) {
            if (versionId != null) {
                throw new IllegalArgumentException("Only TASK entries may have a version");
            }
            entry.setVersion(null);
            return;
        }

        if (versionIdProvided) {
            if (versionId == null) {
                entry.setVersion(null);
                return;
            }
            VersionEntity version = versionService.findById(versionId);
            entry.setVersion(version);
        }
    }

    private void applyImprovement(EntryEntity entry, EntryType finalType, Long improvementId, boolean improvementIdProvided) {
        if (finalType != EntryType.TASK) {
            if (improvementId != null) {
                throw new IllegalArgumentException("Only TASK entries may have an improvement link");
            }
            entry.setImprovement(null);
            return;
        }

        if (improvementIdProvided) {
            if (improvementId == null) {
                entry.setImprovement(null);
                return;
            }
            ImprovementEntity improvement = improvementService.findById(improvementId);
            entry.setImprovement(improvement);
        }
    }
}
