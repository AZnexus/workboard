package com.workboard.version;

import jakarta.validation.Valid;
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
import java.util.List;

@RestController
@RequestMapping("/api/v1/versions")
public class VersionController {

    private final VersionService versionService;

    public VersionController(VersionService versionService) {
        this.versionService = versionService;
    }

    @GetMapping
    public ResponseEntity<List<VersionResponse>> list(@RequestParam(required = false) Boolean active) {
        List<VersionEntity> versions = (active != null && active)
                ? versionService.findActive()
                : versionService.findAll();
        return ResponseEntity.ok(versions.stream().map(VersionResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<VersionResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(VersionResponse.from(versionService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<VersionResponse> create(@Valid @RequestBody CreateVersionRequest request) {
        VersionEntity created = versionService.create(request);
        URI location = URI.create("/api/v1/versions/" + created.getId());
        return ResponseEntity.created(location).body(VersionResponse.from(created));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<VersionResponse> update(@PathVariable Long id,
                                                  @Valid @RequestBody UpdateVersionRequest request) {
        return ResponseEntity.ok(VersionResponse.from(versionService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        versionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
