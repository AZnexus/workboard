package com.workboard.improvement;

import com.workboard.entry.EntryEntity;
import com.workboard.entry.EntryRepository;
import com.workboard.tag.TagEntity;
import com.workboard.tag.TagService;
import com.workboard.version.VersionEntity;
import com.workboard.version.VersionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ImprovementServiceTest {

    @Mock
    private ImprovementRepository improvementRepository;

    @Mock
    private ValuationRepository valuationRepository;

    @Mock
    private ValuationTemplateRepository valuationTemplateRepository;

    @Mock
    private TagService tagService;

    @Mock
    private VersionService versionService;

    @Mock
    private EntryRepository entryRepository;

    @InjectMocks
    private ImprovementService improvementService;

    @Test
    void create_persistsTitleRequirementsVersionManualPercentageSoldHoursAndNoteStructure() {
        VersionEntity version = new VersionEntity();
        version.setId(4L);

        TagEntity tag = new TagEntity();
        tag.setId(7L);
        tag.setName("backend");

        when(versionService.findById(4L)).thenReturn(version);
        when(tagService.findById(7L)).thenReturn(tag);
        when(improvementRepository.save(any(ImprovementEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateImprovementRequest request = new CreateImprovementRequest(
                "Millora backend",
                "Afegir servei",
                "RM-1",
                2,
                LocalDate.of(2026, 6, 20),
                null,
                4L,
                List.of(7L),
                11.5,
                ImprovementStatus.NOVA,
                40,
                new CreateImprovementRequest.ImprovementNoteRequest("Context", "Risc", "Observacions")
        );

        ImprovementEntity created = improvementService.create(request);

        assertThat(created.getTitle()).isEqualTo("Millora backend");
        assertThat(created.getRequirements()).isEqualTo("Afegir servei");
        assertThat(created.getVersion()).isSameAs(version);
        assertThat(created.getCompletionPercentage()).isEqualTo(40);
        assertThat(created.getSoldHours()).isEqualTo(11.5);
        assertThat(created.getNoteContext()).isEqualTo("Context");
        assertThat(created.getNoteRiskDependency()).isEqualTo("Risc");
        assertThat(created.getNoteObservations()).isEqualTo("Observacions");
        assertThat(created.getTags()).hasSize(1);
    }

    @Test
    void create_rejectsDuplicateJiraRefCaseInsensitivelyWhenNonNull() {
        ImprovementEntity existing = new ImprovementEntity();
        existing.setId(1L);
        existing.setJiraRef("WB-200");

        when(improvementRepository.findByJiraRefIgnoreCase("wb-200")).thenReturn(Optional.of(existing));

        CreateImprovementRequest request = new CreateImprovementRequest(
                "Duplicada",
                null,
                null,
                null,
                null,
                "wb-200",
                null,
                List.of(),
                null,
                ImprovementStatus.NOVA,
                0,
                new CreateImprovementRequest.ImprovementNoteRequest(null, null, null)
        );

        assertThatThrownBy(() -> improvementService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Improvement already exists for JIRA: wb-200");

        verify(improvementRepository, never()).save(any(ImprovementEntity.class));
    }

    @Test
    void createValuation_onlyWorksForExistingImprovement() {
        when(improvementRepository.findByIdWithDetails(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> improvementService.createValuation(99L,
                new CreateValuationRequest("RM-VAL-1", LocalDate.of(2026, 7, 1), 3, null, null, null, null, null)))
                .isInstanceOf(ImprovementNotFoundException.class)
                .hasMessage("Improvement not found: 99");
    }

    @Test
    void createSecondValuationForSameImprovement_failsWithConflictSemantics() {
        ImprovementEntity improvement = new ImprovementEntity();
        improvement.setId(10L);
        improvement.setTitle("Millora");

        when(improvementRepository.findByIdWithDetails(10L)).thenReturn(Optional.of(improvement));
        when(valuationRepository.existsByImprovementId(10L)).thenReturn(true);

        assertThatThrownBy(() -> improvementService.createValuation(10L,
                new CreateValuationRequest("RM-VAL-2", LocalDate.of(2026, 7, 2), 4, null, null, null, null, null)))
                .isInstanceOf(ValuationAlreadyExistsException.class)
                .hasMessage("Valuation already exists for improvement: 10");
    }

    @Test
    void createValuation_setsDerivedTitleInheritedVersionInheritedTagsInheritedInitialPriorityAndDefaults() {
        ImprovementEntity improvement = new ImprovementEntity();
        improvement.setId(11L);
        improvement.setTitle("Millora client");
        improvement.setPriority(2);

        ValuationTemplateEntity defaultTemplate = new ValuationTemplateEntity();
        defaultTemplate.setId(3L);
        defaultTemplate.setName("Plantilla base");
        defaultTemplate.setTextileTemplate("h1. Anàlisi");
        defaultTemplate.setDefault(true);
        defaultTemplate.setActive(true);

        VersionEntity version = new VersionEntity();
        version.setId(8L);
        improvement.setVersion(version);

        TagEntity tag = new TagEntity();
        tag.setId(5L);
        tag.setName("api");
        improvement.addTag(tag);

        when(improvementRepository.findByIdWithDetails(11L)).thenReturn(Optional.of(improvement));
        when(valuationRepository.existsByImprovementId(11L)).thenReturn(false);
        when(valuationTemplateRepository.findByIsDefaultTrue()).thenReturn(Optional.of(defaultTemplate));
        when(valuationRepository.save(any(ValuationEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ValuationEntity created = improvementService.createValuation(11L,
                new CreateValuationRequest("RM-VAL-3", LocalDate.of(2026, 8, 1), 5, null, null, null, null, null));

        assertThat(created.getDerivedTitle()).isEqualTo("Valoració - Millora client");
        assertThat(created.getVersion()).isSameAs(version);
        assertThat(created.getImprovement().getTags()).hasSize(1);
        assertThat(created.getPriority()).isEqualTo(5);
        assertThat(created.getStatus()).isEqualTo(ValuationStatus.NO_COMENCADA);
        assertThat(created.getCompletionPercentage()).isEqualTo(0);
        assertThat(created.getValuationTemplate()).isSameAs(defaultTemplate);
        assertThat(created.isTextileCustomized()).isFalse();
    }

    @Test
    void createValuationTemplate_setsRequestedTemplateAsOnlyDefault() {
        ValuationTemplateEntity existingDefault = new ValuationTemplateEntity();
        existingDefault.setId(1L);
        existingDefault.setName("Base");
        existingDefault.setDefault(true);
        existingDefault.setActive(true);

        when(valuationTemplateRepository.findByNameIgnoreCase("Nova plantilla")).thenReturn(Optional.empty());
        when(valuationTemplateRepository.findByIsDefaultTrue()).thenReturn(Optional.of(existingDefault));
        when(valuationTemplateRepository.save(any(ValuationTemplateEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ValuationTemplateEntity created = improvementService.createValuationTemplate(
                new CreateValuationTemplateRequest("Nova plantilla", "h1. Cos", true, true)
        );

        assertThat(created.getName()).isEqualTo("Nova plantilla");
        assertThat(created.getTextileTemplate()).isEqualTo("h1. Cos");
        assertThat(created.isDefault()).isTrue();
        assertThat(created.isActive()).isTrue();
        assertThat(existingDefault.isDefault()).isFalse();
    }

    @Test
    void createValuationTemplate_rejectsInactiveDefaultTemplate() {
        when(valuationTemplateRepository.findByNameIgnoreCase("Default inactiva")).thenReturn(Optional.empty());

        assertThatThrownBy(() -> improvementService.createValuationTemplate(
                new CreateValuationTemplateRequest("Default inactiva", "h1. Cos", true, false)
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Default valuation template cannot be inactive");

        verify(valuationTemplateRepository, never()).save(any(ValuationTemplateEntity.class));
    }

    @Test
    void updateValuationTemplate_reassignsSingleDefaultWithoutLosingActiveState() {
        ValuationTemplateEntity currentDefault = new ValuationTemplateEntity();
        currentDefault.setId(1L);
        currentDefault.setName("Base");
        currentDefault.setDefault(true);
        currentDefault.setActive(true);

        ValuationTemplateEntity template = new ValuationTemplateEntity();
        template.setId(2L);
        template.setName("Secundària");
        template.setTextileTemplate("old");
        template.setDefault(false);
        template.setActive(true);

        when(valuationTemplateRepository.findById(2L)).thenReturn(Optional.of(template));
        when(valuationTemplateRepository.findByNameIgnoreCase("Plantilla final")).thenReturn(Optional.empty());
        when(valuationTemplateRepository.findByIsDefaultTrue()).thenReturn(Optional.of(currentDefault));
        when(valuationTemplateRepository.save(template)).thenReturn(template);

        ValuationTemplateEntity updated = improvementService.updateValuationTemplate(
                2L,
                new UpdateValuationTemplateRequest("Plantilla final", "h1. Final", true, true)
        );

        assertThat(updated.getName()).isEqualTo("Plantilla final");
        assertThat(updated.getTextileTemplate()).isEqualTo("h1. Final");
        assertThat(updated.isDefault()).isTrue();
        assertThat(updated.isActive()).isTrue();
        assertThat(currentDefault.isDefault()).isFalse();
    }

    @Test
    void updateValuationTemplate_rejectsDeactivatingTheCurrentDefaultTemplate() {
        ValuationTemplateEntity defaultTemplate = new ValuationTemplateEntity();
        defaultTemplate.setId(9L);
        defaultTemplate.setName("Base activa");
        defaultTemplate.setTextileTemplate("h1. Base");
        defaultTemplate.setDefault(true);
        defaultTemplate.setActive(true);

        when(valuationTemplateRepository.findById(9L)).thenReturn(Optional.of(defaultTemplate));

        assertThatThrownBy(() -> improvementService.updateValuationTemplate(
                9L,
                new UpdateValuationTemplateRequest(null, null, null, false)
        ))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Default valuation template cannot be inactive");

        verify(valuationTemplateRepository, never()).save(any(ValuationTemplateEntity.class));
    }

    @Test
    void deleteValuationTemplate_rejectsTemplatesStillUsedByValuations() {
        ValuationTemplateEntity template = new ValuationTemplateEntity();
        template.setId(4L);
        template.setName("En ús");
        template.setDefault(false);
        template.setActive(true);

        when(valuationTemplateRepository.findById(4L)).thenReturn(Optional.of(template));
        when(valuationRepository.existsByValuationTemplateId(4L)).thenReturn(true);

        assertThatThrownBy(() -> improvementService.deleteValuationTemplate(4L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Cannot delete valuation template 4 because it is still used by valuations");

        verify(valuationTemplateRepository, never()).delete(any(ValuationTemplateEntity.class));
    }

    @Test
    void deleteValuationTemplate_promotesAnotherTemplateWhenDeletingCurrentDefault() {
        ValuationTemplateEntity defaultTemplate = new ValuationTemplateEntity();
        defaultTemplate.setId(5L);
        defaultTemplate.setName("Default");
        defaultTemplate.setDefault(true);
        defaultTemplate.setActive(true);

        ValuationTemplateEntity fallbackTemplate = new ValuationTemplateEntity();
        fallbackTemplate.setId(6L);
        fallbackTemplate.setName("Fallback");
        fallbackTemplate.setDefault(false);
        fallbackTemplate.setActive(true);

        when(valuationTemplateRepository.findById(5L)).thenReturn(Optional.of(defaultTemplate));
        when(valuationRepository.existsByValuationTemplateId(5L)).thenReturn(false);
        when(valuationTemplateRepository.findFirstByIdNotOrderByIdAsc(5L)).thenReturn(Optional.of(fallbackTemplate));

        improvementService.deleteValuationTemplate(5L);

        assertThat(fallbackTemplate.isDefault()).isTrue();
        verify(valuationTemplateRepository).delete(defaultTemplate);
    }

    @Test
    void deleteValuationTemplate_rejectsInactiveFallbackWhenDeletingCurrentDefault() {
        ValuationTemplateEntity defaultTemplate = new ValuationTemplateEntity();
        defaultTemplate.setId(7L);
        defaultTemplate.setName("Default");
        defaultTemplate.setDefault(true);
        defaultTemplate.setActive(true);

        ValuationTemplateEntity inactiveFallback = new ValuationTemplateEntity();
        inactiveFallback.setId(8L);
        inactiveFallback.setName("Fallback inactiva");
        inactiveFallback.setDefault(false);
        inactiveFallback.setActive(false);

        when(valuationTemplateRepository.findById(7L)).thenReturn(Optional.of(defaultTemplate));
        when(valuationRepository.existsByValuationTemplateId(7L)).thenReturn(false);
        when(valuationTemplateRepository.findFirstByIdNotOrderByIdAsc(7L)).thenReturn(Optional.of(inactiveFallback));

        assertThatThrownBy(() -> improvementService.deleteValuationTemplate(7L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Cannot delete default valuation template because no active fallback exists");

        assertThat(inactiveFallback.isDefault()).isFalse();
        verify(valuationTemplateRepository, never()).delete(defaultTemplate);
    }

    @Test
    void valuationResponse_exposesTemplateMetadataAndCustomizedFlag() {
        ImprovementEntity improvement = new ImprovementEntity();
        improvement.setId(40L);
        improvement.setTitle("Millora metadata");

        ValuationTemplateEntity template = new ValuationTemplateEntity();
        template.setId(7L);
        template.setName("Base configurable");
        template.setDefault(true);
        template.setActive(true);
        template.setTextileTemplate("h1. Base");
        template.setCreatedAt(Instant.parse("2026-05-14T08:00:00Z"));
        template.setUpdatedAt(Instant.parse("2026-05-14T09:00:00Z"));

        ValuationEntity entity = new ValuationEntity();
        entity.setId(41L);
        entity.setImprovement(improvement);
        entity.setDerivedTitle("Valoració - Millora metadata");
        entity.setRedmineChildRef("RM-VAL-META");
        entity.setDueDate(LocalDate.of(2026, 10, 1));
        entity.setStatus(ValuationStatus.EN_CURS);
        entity.setCompletionPercentage(20);
        entity.setValuationTemplate(template);
        entity.setTextileCustomized(true);

        ValuationResponse response = ValuationResponse.from(entity);

        assertThat(response.template()).isNotNull();
        assertThat(response.template().id()).isEqualTo(7L);
        assertThat(response.template().name()).isEqualTo("Base configurable");
        assertThat(response.template().isDefault()).isTrue();
        assertThat(response.textileCustomized()).isTrue();
    }

    @Test
    void createValuation_usesCurrentDefaultTemplateWhenNoSelectionExistsYet() {
        ImprovementEntity improvement = new ImprovementEntity();
        improvement.setId(50L);
        improvement.setTitle("Millora sense selector");

        ValuationTemplateEntity defaultTemplate = new ValuationTemplateEntity();
        defaultTemplate.setId(8L);
        defaultTemplate.setName("Base");
        defaultTemplate.setTextileTemplate("h1. Base");
        defaultTemplate.setDefault(true);
        defaultTemplate.setActive(true);

        when(improvementRepository.findByIdWithDetails(50L)).thenReturn(Optional.of(improvement));
        when(valuationRepository.existsByImprovementId(50L)).thenReturn(false);
        when(valuationTemplateRepository.findByIsDefaultTrue()).thenReturn(Optional.of(defaultTemplate));
        when(valuationRepository.save(any(ValuationEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ValuationEntity created = improvementService.createValuation(50L,
                new CreateValuationRequest("RM-VAL-DEFAULT", LocalDate.of(2026, 12, 1), 2, null, null, null, null, null));

        assertThat(created.getValuationTemplate()).isSameAs(defaultTemplate);
        assertThat(created.isTextileCustomized()).isFalse();
    }

    @Test
    void createValuation_usesProvidedTemplateIdWhenPresent() {
        ImprovementEntity improvement = new ImprovementEntity();
        improvement.setId(51L);
        improvement.setTitle("Millora amb plantilla explícita");

        ValuationTemplateEntity selectedTemplate = new ValuationTemplateEntity();
        selectedTemplate.setId(22L);
        selectedTemplate.setName("Plantilla seleccionada");
        selectedTemplate.setTextileTemplate("h1. Seleccionada");
        selectedTemplate.setDefault(false);
        selectedTemplate.setActive(true);

        when(improvementRepository.findByIdWithDetails(51L)).thenReturn(Optional.of(improvement));
        when(valuationRepository.existsByImprovementId(51L)).thenReturn(false);
        when(valuationTemplateRepository.findById(22L)).thenReturn(Optional.of(selectedTemplate));
        when(valuationRepository.save(any(ValuationEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ValuationEntity created = improvementService.createValuation(51L,
                new CreateValuationRequest("RM-VAL-SELECTED", LocalDate.of(2026, 12, 2), 2, null, null, null, null, 22L));

        assertThat(created.getValuationTemplate()).isSameAs(selectedTemplate);
        verify(valuationTemplateRepository, never()).findByIsDefaultTrue();
    }

    @Test
    void createValuation_rejectsInactiveSelectedTemplate() {
        ImprovementEntity improvement = new ImprovementEntity();
        improvement.setId(52L);
        improvement.setTitle("Millora amb plantilla inactiva");

        ValuationTemplateEntity inactiveTemplate = new ValuationTemplateEntity();
        inactiveTemplate.setId(23L);
        inactiveTemplate.setName("Plantilla inactiva");
        inactiveTemplate.setTextileTemplate("h1. Inactiva");
        inactiveTemplate.setDefault(false);
        inactiveTemplate.setActive(false);

        when(improvementRepository.findByIdWithDetails(52L)).thenReturn(Optional.of(improvement));
        when(valuationRepository.existsByImprovementId(52L)).thenReturn(false);
        when(valuationTemplateRepository.findById(23L)).thenReturn(Optional.of(inactiveTemplate));

        assertThatThrownBy(() -> improvementService.createValuation(52L,
                new CreateValuationRequest("RM-VAL-INACTIVE", LocalDate.of(2026, 12, 3), 2, null, null, null, null, 23L)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Valuation template 23 is inactive");

        verify(valuationRepository, never()).save(any(ValuationEntity.class));
    }

    @Test
    void patchingValuation_updatesEditableFieldsOnly() {
        ImprovementEntity improvement = new ImprovementEntity();
        improvement.setId(12L);

        VersionEntity version = new VersionEntity();
        version.setId(9L);
        improvement.setVersion(version);

        TagEntity tag = new TagEntity();
        tag.setId(6L);
        tag.setName("web");
        improvement.addTag(tag);

        ValuationEntity valuation = new ValuationEntity();
        valuation.setImprovement(improvement);
        valuation.setVersion(version);
        valuation.setDerivedTitle("Valoració - Millora immutable");
        valuation.setRedmineChildRef("RM-VAL-EXISTING");
        valuation.setDueDate(LocalDate.of(2026, 8, 15));
        valuation.setPriority(2);
        valuation.setStatus(ValuationStatus.NO_COMENCADA);
        valuation.setCompletionPercentage(0);

        when(improvementRepository.findByIdWithDetails(12L)).thenReturn(Optional.of(improvement));
        when(valuationRepository.findByImprovementId(12L)).thenReturn(Optional.of(valuation));
        when(valuationRepository.save(valuation)).thenReturn(valuation);

        ValuationEntity updated = improvementService.updateValuation(12L,
                new UpdateValuationRequest(ValuationStatus.EN_CURS, 50, 7, "Body", null, "{}", 3.0, 5.0));

        assertThat(updated.getPriority()).isEqualTo(7);
        assertThat(updated.getStatus()).isEqualTo(ValuationStatus.EN_CURS);
        assertThat(updated.getCompletionPercentage()).isEqualTo(50);
        assertThat(updated.getVersion()).isSameAs(version);
        assertThat(updated.getImprovement().getTags()).hasSize(1);
        assertThat(updated.getDerivedTitle()).isEqualTo("Valoració - Millora immutable");
        assertThat(updated.getRedmineChildRef()).isEqualTo("RM-VAL-EXISTING");
        assertThat(updated.getDueDate()).isEqualTo(LocalDate.of(2026, 8, 15));
    }

    @Test
    void patchingValuation_updatesCustomizedFlag() {
        ImprovementEntity improvement = new ImprovementEntity();
        improvement.setId(14L);

        ValuationEntity valuation = new ValuationEntity();
        valuation.setImprovement(improvement);
        valuation.setTextileCustomized(false);

        when(improvementRepository.findByIdWithDetails(14L)).thenReturn(Optional.of(improvement));
        when(valuationRepository.findByImprovementId(14L)).thenReturn(Optional.of(valuation));
        when(valuationRepository.save(valuation)).thenReturn(valuation);

        ValuationEntity updated = improvementService.updateValuation(14L,
                new UpdateValuationRequest(null, null, null, null, true, null, null, null));

        assertThat(updated.isTextileCustomized()).isTrue();
    }

    @Test
    void findEntries_returnsLinkedTaskEntriesForImprovement() {
        ImprovementEntity improvement = new ImprovementEntity();
        improvement.setId(13L);

        EntryEntity entry = new EntryEntity();
        entry.setId(20L);
        entry.setTitle("Task linked");

        when(improvementRepository.findByIdWithDetails(13L)).thenReturn(Optional.of(improvement));
        when(entryRepository.findAllByImprovementId(eq(13L), any())).thenReturn(new PageImpl<>(List.of(entry), PageRequest.of(0, 20), 1));

        var page = improvementService.findEntries(13L, PageRequest.of(0, 20));

        assertThat(page.getContent()).containsExactly(entry);
    }
}
