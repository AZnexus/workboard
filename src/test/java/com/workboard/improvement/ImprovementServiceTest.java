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
                new CreateValuationRequest("RM-VAL-1", LocalDate.of(2026, 7, 1), 3, null, null, null, null)))
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
                new CreateValuationRequest("RM-VAL-2", LocalDate.of(2026, 7, 2), 4, null, null, null, null)))
                .isInstanceOf(ValuationAlreadyExistsException.class)
                .hasMessage("Valuation already exists for improvement: 10");
    }

    @Test
    void createValuation_setsDerivedTitleInheritedVersionInheritedTagsInheritedInitialPriorityAndDefaults() {
        ImprovementEntity improvement = new ImprovementEntity();
        improvement.setId(11L);
        improvement.setTitle("Millora client");
        improvement.setPriority(2);

        VersionEntity version = new VersionEntity();
        version.setId(8L);
        improvement.setVersion(version);

        TagEntity tag = new TagEntity();
        tag.setId(5L);
        tag.setName("api");
        improvement.addTag(tag);

        when(improvementRepository.findByIdWithDetails(11L)).thenReturn(Optional.of(improvement));
        when(valuationRepository.existsByImprovementId(11L)).thenReturn(false);
        when(valuationRepository.save(any(ValuationEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ValuationEntity created = improvementService.createValuation(11L,
                new CreateValuationRequest("RM-VAL-3", LocalDate.of(2026, 8, 1), 5, null, null, null, null));

        assertThat(created.getDerivedTitle()).isEqualTo("Valoració - Millora client");
        assertThat(created.getVersion()).isSameAs(version);
        assertThat(created.getImprovement().getTags()).hasSize(1);
        assertThat(created.getPriority()).isEqualTo(5);
        assertThat(created.getStatus()).isEqualTo(ValuationStatus.NO_COMENCADA);
        assertThat(created.getCompletionPercentage()).isEqualTo(0);
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
                new UpdateValuationRequest(ValuationStatus.EN_CURS, 50, 7, "Body", "{}", 3.0, 5.0));

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
