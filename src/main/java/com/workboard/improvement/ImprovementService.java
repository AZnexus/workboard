package com.workboard.improvement;

import com.workboard.entry.EntryEntity;
import com.workboard.entry.EntryRepository;
import com.workboard.tag.TagEntity;
import com.workboard.tag.TagService;
import com.workboard.version.VersionEntity;
import com.workboard.version.VersionService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ImprovementService {

    private final ImprovementRepository improvementRepository;
    private final ValuationRepository valuationRepository;
    private final ValuationTemplateRepository valuationTemplateRepository;
    private final TagService tagService;
    private final VersionService versionService;
    private final EntryRepository entryRepository;

    public ImprovementService(
            ImprovementRepository improvementRepository,
            ValuationRepository valuationRepository,
            ValuationTemplateRepository valuationTemplateRepository,
            TagService tagService,
            VersionService versionService,
            EntryRepository entryRepository
    ) {
        this.improvementRepository = improvementRepository;
        this.valuationRepository = valuationRepository;
        this.valuationTemplateRepository = valuationTemplateRepository;
        this.tagService = tagService;
        this.versionService = versionService;
        this.entryRepository = entryRepository;
    }

    @Transactional(readOnly = true)
    public Page<ImprovementEntity> findAll(ImprovementSearchCriteria criteria, Pageable pageable) {
        Specification<ImprovementEntity> specification = Specification.where(null);

        if (criteria.query() != null && !criteria.query().isBlank()) {
            specification = specification.and(ImprovementSpecifications.queryContains(criteria.query().trim()));
        }
        if (criteria.status() != null) {
            specification = specification.and(ImprovementSpecifications.hasStatus(criteria.status()));
        }
        if (criteria.priority() != null) {
            specification = specification.and(ImprovementSpecifications.hasPriority(criteria.priority()));
        }
        if (criteria.versionId() != null) {
            specification = specification.and(ImprovementSpecifications.hasVersionId(criteria.versionId()));
        }
        if (criteria.tag() != null && !criteria.tag().isBlank()) {
            specification = specification.and(ImprovementSpecifications.hasTag(criteria.tag().trim()));
        }
        if (criteria.hasValuation() != null) {
            specification = specification.and(ImprovementSpecifications.hasValuation(criteria.hasValuation()));
        }
        if (criteria.completionFrom() != null) {
            specification = specification.and(ImprovementSpecifications.completionAtLeast(criteria.completionFrom()));
        }
        if (criteria.completionTo() != null) {
            specification = specification.and(ImprovementSpecifications.completionAtMost(criteria.completionTo()));
        }
        if (criteria.dueDateFrom() != null) {
            specification = specification.and(ImprovementSpecifications.dueDateFrom(criteria.dueDateFrom()));
        }
        if (criteria.dueDateTo() != null) {
            specification = specification.and(ImprovementSpecifications.dueDateTo(criteria.dueDateTo()));
        }

        return improvementRepository.findAll(specification, pageable);
    }

    @Transactional(readOnly = true)
    public ImprovementEntity findById(Long id) {
        return improvementRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new ImprovementNotFoundException(id));
    }

    @Transactional
    public ImprovementEntity create(CreateImprovementRequest request) {
        ImprovementEntity entity = new ImprovementEntity();
        applyImprovement(entity, request.title(), request.requirements(), request.redmineParentRef(), request.priority(),
                request.dueDate(), request.jiraRef(), request.versionId(), request.tagIds(), request.soldHours(),
                request.status(), request.completionPercentage(), request.note().context(), request.note().riskDependency(),
                request.note().observations(), true);
        return improvementRepository.save(entity);
    }

    @Transactional
    public ImprovementEntity update(Long id, UpdateImprovementRequest request) {
        ImprovementEntity entity = findById(id);

        if (request.title() != null) {
            entity.setTitle(normalizeTitle(request.title()));
        }
        if (request.requirements() != null) {
            entity.setRequirements(request.requirements());
        }
        if (request.redmineParentRef() != null) {
            entity.setRedmineParentRef(normalizeOptional(request.redmineParentRef()));
        }
        if (request.priority() != null) {
            entity.setPriority(request.priority());
        }
        if (request.dueDate() != null) {
            entity.setDueDate(request.dueDate());
        }
        if (request.jiraRef() != null) {
            String jiraRef = normalizeOptional(request.jiraRef());
            validateUniqueJiraRef(jiraRef, entity.getId());
            entity.setJiraRef(jiraRef);
        }
        if (request.versionId() != null) {
            entity.setVersion(versionService.findById(request.versionId()));
        }
        if (request.tagIds() != null) {
            entity.clearTags();
            request.tagIds().forEach(tagId -> entity.addTag(tagService.findById(tagId)));
        }
        if (request.soldHours() != null) {
            entity.setSoldHours(request.soldHours());
        }
        if (request.status() != null) {
            entity.setStatus(request.status());
        }
        if (request.completionPercentage() != null) {
            entity.setCompletionPercentage(request.completionPercentage());
        }
        if (request.note() != null) {
            entity.setNoteContext(request.note().context());
            entity.setNoteRiskDependency(request.note().riskDependency());
            entity.setNoteObservations(request.note().observations());
        }

        return improvementRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        ImprovementEntity entity = findById(id);
        for (EntryEntity entry : entryRepository.findAllByImprovementId(id)) {
            entry.setImprovement(null);
        }
        improvementRepository.delete(entity);
    }

    @Transactional(readOnly = true)
    public ValuationEntity findValuation(Long improvementId) {
        findById(improvementId);
        return valuationRepository.findByImprovementId(improvementId)
                .orElseThrow(() -> new IllegalArgumentException("Valuation not found for improvement: " + improvementId));
    }

    @Transactional(readOnly = true)
    public java.util.List<ValuationTemplateEntity> findAllValuationTemplates() {
        return valuationTemplateRepository.findAllByOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public ValuationTemplateEntity findValuationTemplateById(Long templateId) {
        return valuationTemplateRepository.findById(templateId)
                .orElseThrow(() -> new ValuationTemplateNotFoundException(templateId));
    }

    @Transactional
    public ValuationTemplateEntity createValuationTemplate(CreateValuationTemplateRequest request) {
        String normalizedName = normalizeRequired(request.name(), "Valuation template name must not be blank");
        String normalizedTemplate = normalizeRequired(request.textileTemplate(), "Valuation template body must not be blank");
        validateUniqueValuationTemplateName(normalizedName, null);
        validateTemplateActivationForDefault(Boolean.TRUE.equals(request.isDefault()), Boolean.TRUE.equals(request.active()));

        ValuationTemplateEntity entity = new ValuationTemplateEntity();
        entity.setName(normalizedName);
        entity.setTextileTemplate(normalizedTemplate);
        entity.setActive(request.active());
        enforceSingleDefaultTemplate(entity, request.isDefault());
        return valuationTemplateRepository.save(entity);
    }

    @Transactional
    public ValuationTemplateEntity updateValuationTemplate(Long templateId, UpdateValuationTemplateRequest request) {
        ValuationTemplateEntity entity = findValuationTemplateById(templateId);
        boolean nextDefault = request.isDefault() != null ? request.isDefault() : entity.isDefault();
        boolean nextActive = request.active() != null ? request.active() : entity.isActive();
        validateTemplateActivationForDefault(nextDefault, nextActive);

        if (request.name() != null) {
            String normalizedName = normalizeRequired(request.name(), "Valuation template name must not be blank");
            validateUniqueValuationTemplateName(normalizedName, templateId);
            entity.setName(normalizedName);
        }
        if (request.textileTemplate() != null) {
            entity.setTextileTemplate(normalizeRequired(request.textileTemplate(), "Valuation template body must not be blank"));
        }
        if (request.active() != null) {
            entity.setActive(request.active());
        }
        if (request.isDefault() != null) {
            if (!request.isDefault() && entity.isDefault()) {
                throw new IllegalArgumentException("A default valuation template is required");
            }
            enforceSingleDefaultTemplate(entity, request.isDefault());
        }

        return valuationTemplateRepository.save(entity);
    }

    @Transactional
    public void deleteValuationTemplate(Long templateId) {
        ValuationTemplateEntity entity = findValuationTemplateById(templateId);
        if (valuationRepository.existsByValuationTemplateId(templateId)) {
            throw new IllegalArgumentException("Cannot delete valuation template " + templateId + " because it is still used by valuations");
        }
        if (entity.isDefault()) {
            ValuationTemplateEntity fallback = valuationTemplateRepository.findFirstByIdNotOrderByIdAsc(templateId)
                    .orElseThrow(() -> new IllegalArgumentException("Cannot delete the only valuation template"));
            if (!fallback.isActive()) {
                throw new IllegalArgumentException("Cannot delete default valuation template because no active fallback exists");
            }
            fallback.setDefault(true);
        }
        valuationTemplateRepository.delete(entity);
    }

    @Transactional
    public ValuationEntity createValuation(Long improvementId, CreateValuationRequest request) {
        ImprovementEntity improvement = findById(improvementId);
        if (valuationRepository.existsByImprovementId(improvementId)) {
            throw new ValuationAlreadyExistsException(improvementId);
        }

        ValuationEntity entity = new ValuationEntity();
        entity.setImprovement(improvement);
        entity.setDerivedTitle("Valoració - " + improvement.getTitle());
        entity.setRedmineChildRef(normalizeRequired(request.redmineChildRef(), "Valuation redmine child ref must not be blank"));
        entity.setDueDate(request.dueDate());
        entity.setPriority(request.priority() != null ? request.priority() : improvement.getPriority());
        entity.setVersion(improvement.getVersion());
        entity.setValuationTemplate(resolveValuationTemplate(request.templateId()));
        entity.setTextileBody(request.textileBody());
        entity.setStructuredContentJson(request.structuredContentJson());
        entity.setTextileCustomized(false);
        entity.setAnalysisHours(request.analysisHours());
        entity.setTotalEstimatedHours(request.totalEstimatedHours());
        entity.setStatus(ValuationStatus.NO_COMENCADA);
        entity.setCompletionPercentage(0);
        return valuationRepository.save(entity);
    }

    @Transactional
    public ValuationEntity updateValuation(Long improvementId, UpdateValuationRequest request) {
        ValuationEntity entity = findValuation(improvementId);
        if (request.status() != null) {
            entity.setStatus(request.status());
        }
        if (request.completionPercentage() != null) {
            entity.setCompletionPercentage(request.completionPercentage());
        }
        if (request.priority() != null) {
            entity.setPriority(request.priority());
        }
        if (request.textileBody() != null) {
            entity.setTextileBody(request.textileBody());
        }
        if (request.textileCustomized() != null) {
            entity.setTextileCustomized(request.textileCustomized());
        }
        if (request.structuredContentJson() != null) {
            entity.setStructuredContentJson(request.structuredContentJson());
        }
        if (request.analysisHours() != null) {
            entity.setAnalysisHours(request.analysisHours());
        }
        if (request.totalEstimatedHours() != null) {
            entity.setTotalEstimatedHours(request.totalEstimatedHours());
        }
        return valuationRepository.save(entity);
    }

    @Transactional(readOnly = true)
    public Page<EntryEntity> findEntries(Long improvementId, Pageable pageable) {
        findById(improvementId);
        return entryRepository.findAllByImprovementId(improvementId, pageable);
    }

    private void applyImprovement(
            ImprovementEntity entity,
            String title,
            String requirements,
            String redmineParentRef,
            Integer priority,
            java.time.LocalDate dueDate,
            String jiraRef,
            Long versionId,
            java.util.List<Long> tagIds,
            Double soldHours,
            ImprovementStatus status,
            Integer completionPercentage,
            String noteContext,
            String noteRiskDependency,
            String noteObservations,
            boolean validateJiraRef
    ) {
        entity.setTitle(normalizeTitle(title));
        entity.setRequirements(requirements);
        entity.setRedmineParentRef(normalizeOptional(redmineParentRef));
        entity.setPriority(priority);
        entity.setDueDate(dueDate);
        String normalizedJiraRef = normalizeOptional(jiraRef);
        if (validateJiraRef) {
            validateUniqueJiraRef(normalizedJiraRef, entity.getId());
        }
        entity.setJiraRef(normalizedJiraRef);
        entity.setVersion(versionId != null ? versionService.findById(versionId) : null);
        entity.clearTags();
        tagIds.forEach(tagId -> {
            TagEntity tag = tagService.findById(tagId);
            entity.addTag(tag);
        });
        entity.setSoldHours(soldHours);
        entity.setStatus(status != null ? status : ImprovementStatus.NOVA);
        entity.setCompletionPercentage(completionPercentage != null ? completionPercentage : 0);
        entity.setNoteContext(noteContext);
        entity.setNoteRiskDependency(noteRiskDependency);
        entity.setNoteObservations(noteObservations);
    }

    private void validateUniqueJiraRef(String jiraRef, Long currentImprovementId) {
        if (jiraRef == null) {
            return;
        }
        improvementRepository.findByJiraRefIgnoreCase(jiraRef).ifPresent(existing -> {
            if (currentImprovementId == null || !existing.getId().equals(currentImprovementId)) {
                throw new IllegalArgumentException("Improvement already exists for JIRA: " + jiraRef);
            }
        });
    }

    private String normalizeTitle(String candidateTitle) {
        return normalizeRequired(candidateTitle, "Improvement title must not be blank");
    }

    private String normalizeRequired(String candidate, String message) {
        String normalized = normalizeOptional(candidate);
        if (normalized == null) {
            throw new IllegalArgumentException(message);
        }
        return normalized;
    }

    private String normalizeOptional(String candidate) {
        if (candidate == null) {
            return null;
        }
        String normalized = candidate.trim();
        return normalized.isEmpty() ? null : normalized;
    }

    private void validateUniqueValuationTemplateName(String candidateName, Long currentTemplateId) {
        valuationTemplateRepository.findByNameIgnoreCase(candidateName).ifPresent(existing -> {
            if (currentTemplateId == null || !existing.getId().equals(currentTemplateId)) {
                throw new IllegalArgumentException("Valuation template already exists: " + candidateName);
            }
        });
    }

    private void enforceSingleDefaultTemplate(ValuationTemplateEntity target, Boolean shouldBeDefault) {
        if (!Boolean.TRUE.equals(shouldBeDefault)) {
            return;
        }
        valuationTemplateRepository.findByIsDefaultTrue().ifPresent(existingDefault -> {
            if (target.getId() == null || !existingDefault.getId().equals(target.getId())) {
                existingDefault.setDefault(false);
            }
        });
        target.setDefault(true);
    }

    private void validateTemplateActivationForDefault(boolean isDefault, boolean isActive) {
        if (isDefault && !isActive) {
            throw new IllegalArgumentException("Default valuation template cannot be inactive");
        }
    }

    private ValuationTemplateEntity getDefaultValuationTemplate() {
        ValuationTemplateEntity template = valuationTemplateRepository.findByIsDefaultTrue()
                .orElseThrow(() -> new IllegalArgumentException("Default valuation template is not configured"));
        if (!template.isActive()) {
            throw new IllegalArgumentException("Default valuation template is inactive");
        }
        return template;
    }

    private ValuationTemplateEntity resolveValuationTemplate(Long templateId) {
        if (templateId != null) {
            ValuationTemplateEntity template = valuationTemplateRepository.findById(templateId)
                    .orElseThrow(() -> new ValuationTemplateNotFoundException(templateId));
            if (!template.isActive()) {
                throw new IllegalArgumentException("Valuation template " + templateId + " is inactive");
            }
            return template;
        }
        return getDefaultValuationTemplate();
    }
}
