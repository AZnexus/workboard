package com.workboard.export;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/export")
public class ExportController {

    private final MarkdownExportService markdownExportService;

    public ExportController(MarkdownExportService markdownExportService) {
        this.markdownExportService = markdownExportService;
    }

    @GetMapping("/markdown")
    public ResponseEntity<String> markdown(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo) {

        String content;
        if (date != null) {
            content = markdownExportService.exportDay(date);
        } else if (dateFrom != null && dateTo != null) {
            content = markdownExportService.exportRange(dateFrom, dateTo);
        } else {
            content = markdownExportService.exportDay(LocalDate.now());
        }

        return ResponseEntity.ok()
                .contentType(MediaType.TEXT_PLAIN)
                .body(content);
    }
}
