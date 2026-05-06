package com.workboard.timelog;

import com.workboard.entry.EntryEntity;
import com.workboard.entry.EntryService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TimeLogServiceTest {

    @Mock
    private TimeLogRepository timeLogRepository;

    @Mock
    private EntryService entryService;

    @InjectMocks
    private TimeLogService timeLogService;

    @Test
    void create_withExistingEntryId_linksEntryThroughServiceBoundary() {
        EntryEntity entry = new EntryEntity();
        entry.setId(7L);

        CreateTimeLogRequest request = new CreateTimeLogRequest(
                7L,
                LocalDate.of(2026, 4, 17),
                new BigDecimal("2.5"),
                "ProjectX",
                "Some work",
                null);

        when(entryService.findOptionalForReference(7L)).thenReturn(Optional.of(entry));
        when(timeLogRepository.save(any(TimeLogEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        TimeLogEntity created = timeLogService.create(request);

        assertThat(created.getEntry()).isSameAs(entry);
        verify(entryService).findOptionalForReference(7L);
    }

    @Test
    void create_withMissingEntryId_preservesCurrentBehavior() {
        CreateTimeLogRequest request = new CreateTimeLogRequest(
                99L,
                LocalDate.of(2026, 4, 17),
                new BigDecimal("2.5"),
                "ProjectX",
                "Some work",
                null);

        when(entryService.findOptionalForReference(99L)).thenReturn(Optional.empty());
        when(timeLogRepository.save(any(TimeLogEntity.class))).thenAnswer(inv -> inv.getArgument(0));

        TimeLogEntity created = timeLogService.create(request);

        assertThat(created.getEntry()).isNull();
        verify(entryService).findOptionalForReference(99L);
    }

    @Test
    void update_withExistingEntryId_linksEntryThroughServiceBoundary() {
        TimeLogEntity existing = new TimeLogEntity();
        existing.setId(3L);

        EntryEntity entry = new EntryEntity();
        entry.setId(8L);

        UpdateTimeLogRequest request = new UpdateTimeLogRequest(
                8L,
                null,
                null,
                null,
                null,
                null);

        when(timeLogRepository.findById(3L)).thenReturn(Optional.of(existing));
        when(entryService.findOptionalForReference(8L)).thenReturn(Optional.of(entry));
        when(timeLogRepository.save(existing)).thenReturn(existing);

        TimeLogEntity updated = timeLogService.update(3L, request);

        assertThat(updated.getEntry()).isSameAs(entry);
        verify(entryService).findOptionalForReference(8L);
    }
}
