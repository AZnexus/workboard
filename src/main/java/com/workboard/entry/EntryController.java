package com.workboard.entry;

import com.workboard.shared.PageResponse;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/entries")
public class EntryController {

    private final EntryService entryService;
    private final ObjectMapper objectMapper;

    public EntryController(EntryService entryService, ObjectMapper objectMapper) {
        this.entryService = entryService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public ResponseEntity<PageResponse<EntryResponse>> list(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dateTo,
            @RequestParam(required = false) EntryStatus status,
            @RequestParam(required = false) EntryType type,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Boolean pinned,
            @RequestParam(required = false) Integer priority,
            @RequestParam(required = false) String q,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("pinned").descending().and(Sort.by("createdAt").descending()));
        Page<EntryEntity> entries = entryService.search(date, dateFrom, dateTo, status, type, tag, pinned, priority, q, pageable);

        return ResponseEntity.ok(PageResponse.from(entries.map(EntryResponse::from)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<EntryResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(EntryResponse.from(entryService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<EntryResponse> create(@Valid @RequestBody CreateEntryRequest request) {
        EntryEntity created = entryService.create(request);
        URI location = URI.create("/api/v1/entries/" + created.getId());
        return ResponseEntity.created(location).body(EntryResponse.from(created));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<EntryResponse> update(@PathVariable Long id,
                                                 @RequestBody JsonNode body) {
        UpdateEntryRequest parsed = objectMapper.convertValue(body, UpdateEntryRequest.class);
        UpdateEntryRequest request = new UpdateEntryRequest(
                parsed.type(),
                parsed.title(),
                parsed.body(),
                parsed.status(),
                parsed.date(),
                parsed.dueDate(),
                parsed.scheduledToday(),
                parsed.tagIds(),
                parsed.externalRef(),
                parsed.pinned(),
                parsed.priority(),
                body.has("dueDate"),
                body.has("scheduledToday")
        );
        return ResponseEntity.ok(EntryResponse.from(entryService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        entryService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
