package com.workboard.entry;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
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

    @InjectMocks
    private EntryService entryService;

    @Test
    void create_savesAndReturnsEntity() {
        CreateEntryRequest request = new CreateEntryRequest(
                EntryType.TASK, "My task", null, null, LocalDate.now(), List.of("work"), null, null);

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
    void findById_notFound_throwsEntryNotFoundException() {
        when(entryRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> entryService.findById(99L))
                .isInstanceOf(EntryNotFoundException.class)
                .hasMessageContaining("99");
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
}
