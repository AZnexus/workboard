package com.workboard.version;

import com.workboard.entry.EntryRepository;
import com.workboard.entry.EntryType;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class VersionServiceTest {

    @Mock
    private VersionRepository versionRepository;

    @Mock
    private EntryRepository entryRepository;

    @InjectMocks
    private VersionService versionService;

    @Test
    void create_rejectsCaseInsensitiveDuplicateName() {
        VersionEntity existing = new VersionEntity();
        existing.setId(1L);
        existing.setName("Release 1");

        when(versionRepository.findByNameIgnoreCase("release 1")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> versionService.create(new CreateVersionRequest("release 1", null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Version already exists");

        verify(versionRepository, never()).save(any(VersionEntity.class));
    }

    @Test
    void update_rejectsCaseInsensitiveDuplicateNameOwnedByAnotherVersion() {
        VersionEntity current = new VersionEntity();
        current.setId(7L);
        current.setName("1.0");

        VersionEntity existing = new VersionEntity();
        existing.setId(8L);
        existing.setName("2.0");

        when(versionRepository.findById(7L)).thenReturn(Optional.of(current));
        when(versionRepository.findByNameIgnoreCase("2.0")).thenReturn(Optional.of(existing));

        assertThatThrownBy(() -> versionService.update(7L, new UpdateVersionRequest("2.0", null, null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Version already exists");

        verify(versionRepository, never()).save(any(VersionEntity.class));
    }

    @Test
    void update_rejectsBlankName() {
        VersionEntity current = new VersionEntity();
        current.setId(7L);
        current.setName("1.0");

        when(versionRepository.findById(7L)).thenReturn(Optional.of(current));

        assertThatThrownBy(() -> versionService.update(7L, new UpdateVersionRequest("   ", null, null)))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Version name must not be blank");

        verify(versionRepository, never()).save(any(VersionEntity.class));
    }

    @Test
    void findActive_returnsOnlyActiveVersionsOrderedByName() {
        VersionEntity active = new VersionEntity();
        active.setId(2L);
        active.setName("2.0");
        when(versionRepository.findByActiveTrueOrderByNameAsc()).thenReturn(List.of(active));

        assertThat(versionService.findActive()).containsExactly(active);
    }

    @Test
    void update_togglesActiveFlag() {
        VersionEntity current = new VersionEntity();
        current.setId(7L);
        current.setName("1.0");
        current.setActive(true);

        when(versionRepository.findById(7L)).thenReturn(Optional.of(current));
        when(versionRepository.save(current)).thenReturn(current);

        VersionEntity updated = versionService.update(7L, new UpdateVersionRequest(null, false, null));

        assertThat(updated.isActive()).isFalse();
        verify(versionRepository).save(current);
    }

    @Test
    void create_usesDefaultColorWhenRequestColorIsNull() {
        when(versionRepository.findByNameIgnoreCase("2026.12")).thenReturn(Optional.empty());
        when(versionRepository.save(any(VersionEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        VersionEntity created = versionService.create(new CreateVersionRequest("2026.12", null));

        assertThat(created.getColor()).isEqualTo("#6B7280");
    }

    @Test
    void update_changesColorWhenProvided() {
        VersionEntity current = new VersionEntity();
        current.setId(11L);
        current.setName("2026.13");
        current.setColor("#6B7280");

        when(versionRepository.findById(11L)).thenReturn(Optional.of(current));
        when(versionRepository.save(current)).thenReturn(current);

        VersionEntity updated = versionService.update(11L, new UpdateVersionRequest(null, null, "#F59E0B"));

        assertThat(updated.getColor()).isEqualTo("#F59E0B");
        verify(versionRepository).save(current);
    }

    @Test
    void delete_rejectsReferencedVersion() {
        VersionEntity version = new VersionEntity();
        version.setId(9L);
        version.setName("9.0");

        when(versionRepository.findById(9L)).thenReturn(Optional.of(version));
        when(entryRepository.existsByTypeAndVersionId(EntryType.TASK, 9L)).thenReturn(true);

        assertThatThrownBy(() -> versionService.delete(9L))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessage("Cannot delete version 9 because it is still assigned to tasks");

        verify(versionRepository, never()).delete(any(VersionEntity.class));
    }
}
