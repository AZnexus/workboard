package com.workboard.entry;

import com.workboard.tag.TagEntity;
import com.workboard.tag.TagNotFoundException;
import com.workboard.tag.TagRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EntryService {

    private final EntryRepository entryRepository;
    private final TagRepository tagRepository;

    public EntryService(EntryRepository entryRepository, TagRepository tagRepository) {
        this.entryRepository = entryRepository;
        this.tagRepository = tagRepository;
    }

    @Transactional(readOnly = true)
    public Page<EntryEntity> findAll(Pageable pageable) {
        return entryRepository.findAll(pageable);
    }

    @Transactional(readOnly = true)
    public Page<EntryEntity> findByDate(LocalDate date, Pageable pageable) {
        return entryRepository.findByDate(date, pageable);
    }

    @Transactional(readOnly = true)
    public Page<EntryEntity> search(LocalDate date, LocalDate dateFrom, LocalDate dateTo,
                                     EntryStatus status, EntryType type, String tag,
                                     Boolean pinned, Integer priority, String q, Pageable pageable) {
        Specification<EntryEntity> spec = Specification.where(null);

        if (date != null) {
            spec = spec.and(EntrySpecifications.hasDate(date));
        } else if (dateFrom != null && dateTo != null) {
            spec = spec.and(EntrySpecifications.dateBetween(dateFrom, dateTo));
        }
        if (status != null) spec = spec.and(EntrySpecifications.hasStatus(status));
        if (type != null) spec = spec.and(EntrySpecifications.hasType(type));
        if (tag != null) spec = spec.and(EntrySpecifications.hasTag(tag));
        if (pinned != null && pinned) spec = spec.and(EntrySpecifications.isPinned());
        if (priority != null) spec = spec.and(EntrySpecifications.hasPriority(priority));
        if (q != null && !q.isBlank()) spec = spec.and(EntrySpecifications.titleOrBodyContains(q.trim()));

        return entryRepository.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public EntryEntity findById(Long id) {
        return entryRepository.findById(id)
                .orElseThrow(() -> new EntryNotFoundException(id));
    }

    @Transactional
    public EntryEntity create(CreateEntryRequest request) {
        EntryEntity entry = new EntryEntity();
        entry.setType(request.type());
        entry.setTitle(request.title());
        entry.setBody(request.body());
        entry.setDate(request.date());
        entry.setDueDate(request.dueDate());
        entry.setExternalRef(request.externalRef());
        entry.setPriority(request.priority());

        if (request.status() != null) {
            entry.setStatus(request.status());
        }

        if (request.tagIds() != null) {
            request.tagIds().forEach(tagId -> {
                TagEntity tagEntity = tagRepository.findById(tagId)
                        .orElseThrow(() -> new TagNotFoundException(tagId));
                entry.addTag(tagEntity);
            });
        }

        return entryRepository.save(entry);
    }

    @Transactional
    public EntryEntity update(Long id, UpdateEntryRequest request) {
        EntryEntity entry = findById(id);

        if (request.type() != null) entry.setType(request.type());
        if (request.title() != null) entry.setTitle(request.title());
        if (request.body() != null) entry.setBody(request.body());
        if (request.status() != null) {
            entry.setStatus(request.status());
            if (request.status() == EntryStatus.IN_PROGRESS && entry.getDueDate() == null) {
                entry.setDueDate(LocalDate.now());
            }
        }
        if (request.date() != null) entry.setDate(request.date());
        if (request.dueDateProvided()) entry.setDueDate(request.dueDate());
        if (request.externalRef() != null) entry.setExternalRef(request.externalRef());
        if (request.pinned() != null) entry.setPinned(request.pinned());
        if (request.priority() != null) entry.setPriority(request.priority());
        if (request.tagIds() != null) {
            entry.clearTags();
            entryRepository.flush();
            request.tagIds().forEach(tagId -> {
                TagEntity tagEntity = tagRepository.findById(tagId)
                        .orElseThrow(() -> new TagNotFoundException(tagId));
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
}
