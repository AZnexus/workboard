package com.workboard.export;

import com.workboard.entry.EntryEntity;
import com.workboard.entry.EntryRepository;
import com.workboard.timelog.TimeLogEntity;
import com.workboard.timelog.TimeLogRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class MarkdownExportService {

    private final EntryRepository entryRepository;
    private final TimeLogRepository timeLogRepository;

    public MarkdownExportService(EntryRepository entryRepository, TimeLogRepository timeLogRepository) {
        this.entryRepository = entryRepository;
        this.timeLogRepository = timeLogRepository;
    }

    @Transactional(readOnly = true)
    public String exportDay(LocalDate date) {
        return buildMarkdown(date,
                entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(date),
                timeLogRepository.findByDate(date));
    }

    @Transactional(readOnly = true)
    public String exportRange(LocalDate from, LocalDate to) {
        StringBuilder sb = new StringBuilder();
        LocalDate current = from;
        while (!current.isAfter(to)) {
            if (sb.length() > 0) sb.append("\n\n");
            sb.append(buildMarkdown(current,
                    entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(current),
                    timeLogRepository.findByDate(current)));
            current = current.plusDays(1);
        }
        return sb.toString();
    }

    private String buildMarkdown(LocalDate date, List<EntryEntity> entries, List<TimeLogEntity> timeLogs) {
        StringBuilder sb = new StringBuilder();
        sb.append("# ").append(date).append("\n\n");

        if (!entries.isEmpty()) {
            sb.append("## Entries\n\n");
            for (EntryEntity e : entries) {
                String checkbox = switch (e.getStatus()) {
                    case DONE -> "[x]";
                    case IN_PROGRESS -> "[-]";
                    case CANCELLED -> "[~]";
                    default -> "[ ]";
                };
                sb.append("- ").append(checkbox).append(" **").append(e.getTitle()).append("**");
                if (e.getExternalRef() != null && !e.getExternalRef().isBlank()) {
                    sb.append(" `").append(e.getExternalRef()).append("`");
                }
                if (!e.getTags().isEmpty()) {
                    e.getTags().forEach(t -> sb.append(" #").append(t.getTag()));
                }
                sb.append("\n");
                if (e.getBody() != null && !e.getBody().isBlank()) {
                    sb.append("  ").append(e.getBody()).append("\n");
                }
            }
        }

        if (!timeLogs.isEmpty()) {
            sb.append("\n## Time Log\n\n");
            sb.append("| Project | Hours | Description |\n");
            sb.append("|---------|-------|-------------|\n");
            for (TimeLogEntity t : timeLogs) {
                sb.append("| ").append(t.getProject())
                        .append(" | ").append(t.getHours())
                        .append(" | ").append(t.getDescription() != null ? t.getDescription() : "")
                        .append(" |\n");
            }
        }

        return sb.toString();
    }
}
