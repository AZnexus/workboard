package com.workboard.export;

import com.workboard.entry.EntryEntity;
import com.workboard.entry.EntryRepository;
import com.workboard.entry.EntryStatus;
import com.workboard.entry.EntryType;
import com.workboard.timelog.TimeLogEntity;
import com.workboard.timelog.TimeLogRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class MarkdownExportServiceTest {

    @Mock
    private EntryRepository entryRepository;

    @Mock
    private TimeLogRepository timeLogRepository;

    @InjectMocks
    private MarkdownExportService markdownExportService;

    @Test
    void exportDay_formatsEntriesAndTimeLogs() {
        LocalDate date = LocalDate.of(2026, 4, 17);

        EntryEntity entry = new EntryEntity();
        entry.setId(1L);
        entry.setTitle("Fix bug");
        entry.setType(EntryType.TASK);
        entry.setStatus(EntryStatus.DONE);
        entry.setDate(date);

        TimeLogEntity log = new TimeLogEntity();
        log.setId(1L);
        log.setDate(date);
        log.setHours(new BigDecimal("1.5"));
        log.setProject("Backend");
        log.setDescription("Bug fixing");

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(date)).thenReturn(List.of(entry));
        when(timeLogRepository.findByDate(date)).thenReturn(List.of(log));

        String markdown = markdownExportService.exportDay(date);

        assertThat(markdown).contains("# 2026-04-17");
        assertThat(markdown).contains("## Entries");
        assertThat(markdown).contains("[x] **Fix bug**");
        assertThat(markdown).contains("## Time Log");
        assertThat(markdown).contains("| Backend |");
        assertThat(markdown).contains("1.5");
    }

    @Test
    void exportDay_openEntry_usesEmptyCheckbox() {
        LocalDate date = LocalDate.of(2026, 4, 17);

        EntryEntity entry = new EntryEntity();
        entry.setId(2L);
        entry.setTitle("Open task");
        entry.setType(EntryType.TASK);
        entry.setStatus(EntryStatus.OPEN);
        entry.setDate(date);

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(date)).thenReturn(List.of(entry));
        when(timeLogRepository.findByDate(date)).thenReturn(List.of());

        String markdown = markdownExportService.exportDay(date);

        assertThat(markdown).contains("[ ] **Open task**");
    }
}
