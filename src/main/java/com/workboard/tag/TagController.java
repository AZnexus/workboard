package com.workboard.tag;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/tags")
public class TagController {

    private final TagService tagService;

    public TagController(TagService tagService) {
        this.tagService = tagService;
    }

    @GetMapping
    public ResponseEntity<List<TagResponse>> list() {
        return ResponseEntity.ok(tagService.findAll().stream().map(TagResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<TagResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(TagResponse.from(tagService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<TagResponse> create(@Valid @RequestBody CreateTagRequest request) {
        TagEntity created = tagService.create(request);
        URI location = URI.create("/api/v1/tags/" + created.getId());
        return ResponseEntity.created(location).body(TagResponse.from(created));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<TagResponse> update(@PathVariable Long id,
                                               @Valid @RequestBody UpdateTagRequest request) {
        return ResponseEntity.ok(TagResponse.from(tagService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        tagService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
