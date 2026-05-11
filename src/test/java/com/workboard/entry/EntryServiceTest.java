package com.workboard.entry;

import com.workboard.tag.TagEntity;
import com.workboard.tag.TagNotFoundException;
import com.workboard.tag.TagService;
import com.workboard.version.VersionEntity;
import com.workboard.version.VersionService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class EntryServiceTest {

    @Mock
    private EntryRepository entryRepository;

    @Mock
    private TagService tagService;

    @Mock
    private VersionService versionService;

    @InjectMocks
    private EntryService entryService;

    @Test
    void create_savesEntity() {
        CreateEntryRequest request = new CreateEntryRequest(
                EntryType.TASK, "My task", null, null, LocalDate.now(), null, null, List.of(), null, null, null);

        EntryEntity saved = new EntryEntity();
        saved.setId(1L);
        saved.setType(EntryType.TASK);
        saved.setTitle("My task");

        when(entryRepository.save(any(EntryEntity.class))).thenReturn(saved);

        EntryEntity result = entryService.create(request);

        assertThat(result.getId()).isEqualTo(1L);
        assertThat(result.getTitle()).isEqualTo("My task");
        verify(entryRepository).save(any(EntryEntity.class));
    }

    @Test
    void findAll_usesRepositoryMethodThatFetchesTags() {
        Pageable pageable = PageRequest.of(0, 20);
        Page<EntryEntity> page = new PageImpl<>(List.of(new EntryEntity()));

        when(entryRepository.findAllWithTags(pageable)).thenReturn(page);

        Page<EntryEntity> result = entryService.findAll(pageable);

        assertThat(result).isSameAs(page);
        verify(entryRepository).findAllWithTags(pageable);
        verify(entryRepository, never()).findAll(pageable);
    }

    @Test
    void search_usesRepositoryMethodThatFetchesTags() {
        EntrySearchCriteria criteria = new EntrySearchCriteria(
                LocalDate.of(2026, 4, 24),
                null,
                null,
                EntryStatus.OPEN,
                EntryType.TASK,
                "backend",
                true,
                1,
                "needle"
        );
        Pageable pageable = PageRequest.of(0, 20);
        Page<EntryEntity> page = new PageImpl<>(List.of(new EntryEntity()));

        when(entryRepository.findAllWithTags(any(), eq(pageable))).thenReturn(page);

        Page<EntryEntity> result = entryService.search(criteria, pageable);

        assertThat(result).isSameAs(page);
        verify(entryRepository).findAllWithTags(any(), eq(pageable));
        verify(entryRepository, never()).findAll(any(org.springframework.data.jpa.domain.Specification.class), eq(pageable));
    }

    @Test
    void findById_notFound_throwsEntryNotFoundException() {
        when(entryRepository.findByIdWithTags(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> entryService.findById(99L))
                .isInstanceOf(EntryNotFoundException.class)
                .hasMessageContaining("99");

        verify(entryRepository).findByIdWithTags(99L);
        verify(entryRepository, never()).findById(99L);
    }

    @Test
    void findById_usesRepositoryMethodThatFetchesTags() {
        EntryEntity entry = new EntryEntity();
        entry.setId(5L);

        when(entryRepository.findByIdWithTags(5L)).thenReturn(Optional.of(entry));

        EntryEntity result = entryService.findById(5L);

        assertThat(result).isSameAs(entry);
        verify(entryRepository).findByIdWithTags(5L);
        verify(entryRepository, never()).findById(5L);
    }

    @Test
    void delete_existingEntry_deletesSuccessfully() {
        when(entryRepository.existsById(1L)).thenReturn(true);

        entryService.delete(1L);

        verify(entryRepository).deleteById(1L);
    }

    @Test
    void delete_nonExistentEntry_throwsEntryNotFoundException() {
        when(entryRepository.existsById(42L)).thenReturn(false);

        assertThatThrownBy(() -> entryService.delete(42L))
                .isInstanceOf(EntryNotFoundException.class)
                .hasMessageContaining("42");

        verify(entryRepository, never()).deleteById(any());
    }

    @Test
    void update_clearsDueDateWhenExplicitlyRequested() {
        EntryEntity existing = new EntryEntity();
        existing.setId(7L);
        existing.setType(EntryType.TASK);
        existing.setTitle("Scheduled task");
        existing.setDate(LocalDate.of(2026, 4, 24));
        existing.setDueDate(LocalDate.of(2026, 4, 24));

        UpdateEntryRequest request = new UpdateEntryRequest(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                true,
                true,
                false);

        when(entryRepository.findByIdWithTags(7L)).thenReturn(Optional.of(existing));
        when(entryRepository.save(existing)).thenReturn(existing);

        EntryEntity updated = entryService.update(7L, request);

        assertThat(updated.getDueDate()).isNull();
        verify(entryRepository).save(existing);
    }

    @Test
    void update_doesNotAutoSetDueDateWhenMarkedInProgress() {
        EntryEntity existing = new EntryEntity();
        existing.setId(8L);
        existing.setType(EntryType.TASK);
        existing.setTitle("In progress task");
        existing.setDate(LocalDate.of(2026, 4, 24));

        UpdateEntryRequest request = new UpdateEntryRequest(
                null,
                null,
                null,
                EntryStatus.IN_PROGRESS,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                false,
                false);

        when(entryRepository.findByIdWithTags(8L)).thenReturn(Optional.of(existing));
        when(entryRepository.save(existing)).thenReturn(existing);

        EntryEntity updated = entryService.update(8L, request);

        assertThat(updated.getDueDate()).isNull();
        verify(entryRepository).save(existing);
    }

    @Test
    void create_resolvesTagsThroughTagService() {
        TagEntity tagEntity = new TagEntity();
        tagEntity.setId(10L);
        tagEntity.setName("backend");

        CreateEntryRequest request = new CreateEntryRequest(
                EntryType.TASK,
                "Tagged task",
                null,
                null,
                LocalDate.now(),
                null,
                null,
                List.of(10L),
                null,
                null,
                null);

        when(tagService.findById(10L)).thenReturn(tagEntity);
        when(entryRepository.save(any(EntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EntryEntity result = entryService.create(request);

        assertThat(result.getTags()).hasSize(1);
        assertThat(result.getTags().get(0).getTag()).isEqualTo("backend");
        verify(tagService).findById(10L);
        verify(entryRepository).save(any(EntryEntity.class));
    }

    @Test
    void create_missingTag_propagatesTagNotFoundException() {
        CreateEntryRequest request = new CreateEntryRequest(
                EntryType.TASK,
                "Tagged task",
                null,
                null,
                LocalDate.now(),
                null,
                null,
                List.of(999L),
                null,
                null,
                null);

        when(tagService.findById(999L)).thenThrow(new TagNotFoundException(999L));

        assertThatThrownBy(() -> entryService.create(request))
                .isInstanceOf(TagNotFoundException.class)
                .hasMessageContaining("999");

        verify(tagService).findById(999L);
        verify(entryRepository, never()).save(any());
    }

    @Test
    void create_taskWithVersion_resolvesVersionThroughVersionService() {
        VersionEntity version = new VersionEntity();
        version.setId(44L);
        version.setName("2026.05");

        CreateEntryRequest request = new CreateEntryRequest(
                EntryType.TASK,
                "Task with version",
                null,
                null,
                LocalDate.now(),
                null,
                null,
                List.of(),
                null,
                null,
                44L);

        when(versionService.findById(44L)).thenReturn(version);
        when(entryRepository.save(any(EntryEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        EntryEntity result = entryService.create(request);

        assertThat(result.getVersion()).isSameAs(version);
        verify(versionService).findById(44L);
    }

    @Test
    void create_nonTaskWithVersion_rejectsRequest() {
        CreateEntryRequest request = new CreateEntryRequest(
                EntryType.NOTE,
                "Invalid note",
                null,
                null,
                LocalDate.now(),
                null,
                null,
                List.of(),
                null,
                null,
                44L);

        assertThatThrownBy(() -> entryService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only TASK entries may have a version");

        verify(versionService, never()).findById(any());
        verify(entryRepository, never()).save(any());
    }

    @Test
    void update_taskVersion_canChangeAndClear() {
        EntryEntity existing = new EntryEntity();
        existing.setId(12L);
        existing.setType(EntryType.TASK);
        existing.setTitle("Task with version");

        VersionEntity currentVersion = new VersionEntity();
        currentVersion.setId(44L);
        existing.setVersion(currentVersion);

        VersionEntity replacementVersion = new VersionEntity();
        replacementVersion.setId(45L);
        replacementVersion.setName("2026.06");

        when(entryRepository.findByIdWithTags(12L)).thenReturn(Optional.of(existing));
        when(versionService.findById(45L)).thenReturn(replacementVersion);
        when(entryRepository.save(existing)).thenReturn(existing);

        UpdateEntryRequest changeRequest = new UpdateEntryRequest(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                45L,
                false,
                false,
                true);

        EntryEntity changed = entryService.update(12L, changeRequest);
        assertThat(changed.getVersion()).isSameAs(replacementVersion);

        UpdateEntryRequest clearRequest = new UpdateEntryRequest(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                false,
                true);

        EntryEntity cleared = entryService.update(12L, clearRequest);
        assertThat(cleared.getVersion()).isNull();
    }

    @Test
    void update_nonTaskWithVersion_rejectsRequest() {
        EntryEntity existing = new EntryEntity();
        existing.setId(13L);
        existing.setType(EntryType.NOTE);
        existing.setTitle("Plain note");

        when(entryRepository.findByIdWithTags(13L)).thenReturn(Optional.of(existing));

        UpdateEntryRequest request = new UpdateEntryRequest(
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                52L,
                false,
                false,
                true);

        assertThatThrownBy(() -> entryService.update(13L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Only TASK entries may have a version");

        verify(versionService, never()).findById(any());
        verify(entryRepository, never()).save(any());
    }

    @Test
    void update_changingTaskToNonTask_clearsVersionAutomatically() {
        EntryEntity existing = new EntryEntity();
        existing.setId(14L);
        existing.setType(EntryType.TASK);
        existing.setTitle("Task becomes note");

        VersionEntity version = new VersionEntity();
        version.setId(53L);
        existing.setVersion(version);

        when(entryRepository.findByIdWithTags(14L)).thenReturn(Optional.of(existing));
        when(entryRepository.save(existing)).thenReturn(existing);

        UpdateEntryRequest request = new UpdateEntryRequest(
                EntryType.NOTE,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                null,
                false,
                false,
                false);

        EntryEntity updated = entryService.update(14L, request);

        assertThat(updated.getType()).isEqualTo(EntryType.NOTE);
        assertThat(updated.getVersion()).isNull();
        verify(entryRepository).save(existing);
    }
}
