package com.workboard.improvement;

import com.workboard.entry.EntryResponse;
import com.workboard.shared.PageResponse;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/improvements")
public class ImprovementController {

    private final ImprovementService improvementService;

    public ImprovementController(ImprovementService improvementService) {
        this.improvementService = improvementService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<ImprovementResponse>> list(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) ImprovementStatus status,
            @RequestParam(required = false) Integer priority,
            @RequestParam(required = false) Long versionId,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) Boolean hasValuation,
            @RequestParam(required = false) Integer completionFrom,
            @RequestParam(required = false) Integer completionTo,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate dueDateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"));
        ImprovementSearchCriteria criteria = new ImprovementSearchCriteria(
                q, status, priority, versionId, tag, hasValuation, completionFrom, completionTo, dueDateFrom, dueDateTo
        );
        Page<ImprovementResponse> responsePage = improvementService.findAll(criteria, pageable).map(ImprovementResponse::from);
        return ResponseEntity.ok(PageResponse.from(responsePage));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ImprovementResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ImprovementResponse.from(improvementService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ImprovementResponse> create(@Valid @RequestBody CreateImprovementRequest request) {
        ImprovementEntity created = improvementService.create(request);
        URI location = URI.create("/api/v1/improvements/" + created.getId());
        return ResponseEntity.created(location).body(ImprovementResponse.from(created));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ImprovementResponse> update(@PathVariable Long id, @Valid @RequestBody UpdateImprovementRequest request) {
        return ResponseEntity.ok(ImprovementResponse.from(improvementService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        improvementService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/valuation")
    public ResponseEntity<ValuationResponse> createValuation(@PathVariable Long id, @Valid @RequestBody CreateValuationRequest request) {
        var created = improvementService.createValuation(id, request);
        URI location = URI.create("/api/v1/improvements/" + id + "/valuation");
        return ResponseEntity.created(location).body(ValuationResponse.from(created));
    }

    @GetMapping("/{id}/valuation")
    public ResponseEntity<ValuationResponse> getValuation(@PathVariable Long id) {
        return ResponseEntity.ok(ValuationResponse.from(improvementService.findValuation(id)));
    }

    @PatchMapping("/{id}/valuation")
    public ResponseEntity<ValuationResponse> updateValuation(@PathVariable Long id, @RequestBody UpdateValuationRequest request) {
        return ResponseEntity.ok(ValuationResponse.from(improvementService.updateValuation(id, request)));
    }

    @GetMapping("/{id}/entries")
    public ResponseEntity<PageResponse<EntryResponse>> getEntries(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<EntryResponse> entries = improvementService.findEntries(id, pageable).map(EntryResponse::from);
        return ResponseEntity.ok(PageResponse.from(entries));
    }
}
