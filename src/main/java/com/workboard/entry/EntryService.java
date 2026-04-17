package com.workboard.entry;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class EntryService {

    private final EntryRepository entryRepository;

    public EntryService(EntryRepository entryRepository) {
        this.entryRepository = entryRepository;
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
        entry.setExternalRef(request.externalRef());

        if (request.status() != null) {
            entry.setStatus(request.status());
        }

        if (request.tags() != null) {
            request.tags().forEach(entry::addTag);
        }

        return entryRepository.save(entry);
    }

    @Transactional
    public EntryEntity update(Long id, UpdateEntryRequest request) {
        EntryEntity entry = findById(id);

        if (request.type() != null) entry.setType(request.type());
        if (request.title() != null) entry.setTitle(request.title());
        if (request.body() != null) entry.setBody(request.body());
        if (request.status() != null) entry.setStatus(request.status());
        if (request.date() != null) entry.setDate(request.date());
        if (request.externalRef() != null) entry.setExternalRef(request.externalRef());
        if (request.pinned() != null) entry.setPinned(request.pinned());
        if (request.tags() != null) {
            entry.clearTags();
            request.tags().forEach(entry::addTag);
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
