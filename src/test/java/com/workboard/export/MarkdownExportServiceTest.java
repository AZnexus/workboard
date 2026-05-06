package com.workboard.export;

import com.workboard.entry.EntryEntity;
import com.workboard.entry.EntryRepository;
import com.workboard.entry.EntryStatus;
import com.workboard.entry.EntryType;
import com.workboard.tag.TagEntity;
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
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
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

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(date)).thenReturn(List.of(entry));
        when(timeLogRepository.findByDate(date)).thenReturn(List.of(log));

        String markdown = markdownExportService.exportDay(date);

        assertThat(markdown).contains("# 2026-04-17");
        assertThat(markdown).contains("## Tasques");
        assertThat(markdown).contains("[x] **Fix bug**");
        assertThat(markdown).contains("## Registre d'Hores");
        assertThat(markdown).contains("| Backend |");
        assertThat(markdown).contains("1.5");
        verify(entryRepository).findByDateOrderByPinnedDescCreatedAtDescWithTags(date);
        verify(entryRepository, never()).findByDateOrderByPinnedDescCreatedAtDesc(date);
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

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(date)).thenReturn(List.of(entry));
        when(timeLogRepository.findByDate(date)).thenReturn(List.of());

        String markdown = markdownExportService.exportDay(date);

        assertThat(markdown).contains("[ ] **Open task**");
        verify(entryRepository).findByDateOrderByPinnedDescCreatedAtDescWithTags(date);
        verify(entryRepository, never()).findByDateOrderByPinnedDescCreatedAtDesc(date);
    }

    @Test
    void exportDay_rendersHashtagsFromEntryTags() {
        LocalDate date = LocalDate.of(2026, 4, 17);

        EntryEntity entry = new EntryEntity();
        entry.setId(3L);
        entry.setTitle("Tagged task");
        entry.setType(EntryType.TASK);
        entry.setStatus(EntryStatus.OPEN);
        entry.setDate(date);

        TagEntity backend = new TagEntity();
        backend.setName("backend");
        entry.addTag(backend);

        TagEntity urgent = new TagEntity();
        urgent.setName("urgent");
        entry.addTag(urgent);

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(date)).thenReturn(List.of(entry));
        when(timeLogRepository.findByDate(date)).thenReturn(List.of());

        String markdown = markdownExportService.exportDay(date);

        assertThat(markdown).contains("[ ] **Tagged task** #backend #urgent");
        verify(entryRepository).findByDateOrderByPinnedDescCreatedAtDescWithTags(date);
        verify(entryRepository, never()).findByDateOrderByPinnedDescCreatedAtDesc(date);
    }

    @Test
    void exportDay_escapesUnsafeMarkdownAndHtmlCharactersInTagNames() {
        LocalDate date = LocalDate.of(2026, 4, 17);

        EntryEntity entry = new EntryEntity();
        entry.setId(4L);
        entry.setTitle("Tagged task");
        entry.setType(EntryType.TASK);
        entry.setStatus(EntryStatus.OPEN);
        entry.setDate(date);

        TagEntity unsafe = new TagEntity();
        unsafe.setName("ops<script>alert(1)</script>_team");
        entry.addTag(unsafe);

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(date)).thenReturn(List.of(entry));
        when(timeLogRepository.findByDate(date)).thenReturn(List.of());

        String markdown = markdownExportService.exportDay(date);

        assertThat(markdown).contains("#ops&lt;script&gt;alert\\(1\\)&lt;/script&gt;\\_team");
    }

    @Test
    void exportRange_usesTaggedDateQueryForEachDayInRange() {
        LocalDate from = LocalDate.of(2026, 4, 17);
        LocalDate to = from.plusDays(1);

        EntryEntity firstDayEntry = new EntryEntity();
        firstDayEntry.setId(4L);
        firstDayEntry.setTitle("First day tagged task");
        firstDayEntry.setType(EntryType.TASK);
        firstDayEntry.setStatus(EntryStatus.OPEN);
        firstDayEntry.setDate(from);

        TagEntity backend = new TagEntity();
        backend.setName("backend");
        firstDayEntry.addTag(backend);

        EntryEntity secondDayEntry = new EntryEntity();
        secondDayEntry.setId(5L);
        secondDayEntry.setTitle("Second day tagged task");
        secondDayEntry.setType(EntryType.TASK);
        secondDayEntry.setStatus(EntryStatus.OPEN);
        secondDayEntry.setDate(to);

        TagEntity urgent = new TagEntity();
        urgent.setName("urgent");
        secondDayEntry.addTag(urgent);

        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(from)).thenReturn(List.of(firstDayEntry));
        when(entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(to)).thenReturn(List.of(secondDayEntry));
        when(timeLogRepository.findByDate(from)).thenReturn(List.of());
        when(timeLogRepository.findByDate(to)).thenReturn(List.of());

        String markdown = markdownExportService.exportRange(from, to);

        assertThat(markdown).contains("**First day tagged task** #backend");
        assertThat(markdown).contains("**Second day tagged task** #urgent");
        verify(entryRepository).findByDateOrderByPinnedDescCreatedAtDescWithTags(from);
        verify(entryRepository).findByDateOrderByPinnedDescCreatedAtDescWithTags(to);
        verify(entryRepository, times(2)).findByDateOrderByPinnedDescCreatedAtDescWithTags(org.mockito.ArgumentMatchers.any(LocalDate.class));
        verify(entryRepository, never()).findByDateOrderByPinnedDescCreatedAtDesc(from);
        verify(entryRepository, never()).findByDateOrderByPinnedDescCreatedAtDesc(to);
    }
}
