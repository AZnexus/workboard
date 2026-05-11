package com.workboard.version;

import com.workboard.entry.EntryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VersionService {

    private final VersionRepository versionRepository;
    private final EntryRepository entryRepository;

    public VersionService(VersionRepository versionRepository, EntryRepository entryRepository) {
        this.versionRepository = versionRepository;
        this.entryRepository = entryRepository;
    }

    @Transactional(readOnly = true)
    public List<VersionEntity> findAll() {
        return versionRepository.findAllByOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public List<VersionEntity> findActive() {
        return versionRepository.findByActiveTrueOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public VersionEntity findById(Long id) {
        return versionRepository.findById(id)
                .orElseThrow(() -> new VersionNotFoundException(id));
    }

    @Transactional
    public VersionEntity create(CreateVersionRequest request) {
        String normalizedName = normalizeVersionName(request.name());
        validateUniqueVersionName(normalizedName, null);
        VersionEntity entity = new VersionEntity();
        entity.setName(normalizedName);
        entity.setColor(normalizeVersionColor(request.color()));
        return versionRepository.save(entity);
    }

    @Transactional
    public VersionEntity update(Long id, UpdateVersionRequest request) {
        VersionEntity entity = findById(id);
        if (request.name() != null) {
            String normalizedName = normalizeVersionName(request.name());
            validateUniqueVersionName(normalizedName, id);
            entity.setName(normalizedName);
        }
        if (request.active() != null) {
            entity.setActive(request.active());
        }
        if (request.color() != null) {
            entity.setColor(normalizeVersionColor(request.color()));
        }
        return versionRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        VersionEntity entity = findById(id);
        if (entryRepository.existsByTypeAndVersionId(com.workboard.entry.EntryType.TASK, id)) {
            throw new IllegalArgumentException("Cannot delete version " + id + " because it is still assigned to tasks");
        }
        versionRepository.delete(entity);
    }

    private void validateUniqueVersionName(String candidateName, Long currentVersionId) {
        versionRepository.findByNameIgnoreCase(candidateName).ifPresent(existing -> {
            if (currentVersionId == null || !existing.getId().equals(currentVersionId)) {
                throw new IllegalArgumentException("Version already exists: " + candidateName);
            }
        });
    }

    private String normalizeVersionName(String candidateName) {
        String normalizedName = candidateName == null ? null : candidateName.trim();
        if (normalizedName == null || normalizedName.isEmpty()) {
            throw new IllegalArgumentException("Version name must not be blank");
        }
        return normalizedName;
    }

    private String normalizeVersionColor(String candidateColor) {
        String normalizedColor = candidateColor == null ? null : candidateColor.trim();
        if (normalizedColor == null || normalizedColor.isEmpty()) {
            throw new IllegalArgumentException("Version color must not be blank");
        }
        return normalizedColor;
    }
}
