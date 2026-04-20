package com.workboard.project;

import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.net.URI;
import java.util.List;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {

    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public ResponseEntity<List<ProjectResponse>> list(@RequestParam(required = false) Boolean active) {
        List<ProjectEntity> projects = (active != null && active)
                ? projectService.findActive()
                : projectService.findAll();
        return ResponseEntity.ok(projects.stream().map(ProjectResponse::from).toList());
    }

    @GetMapping("/{id}")
    public ResponseEntity<ProjectResponse> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ProjectResponse.from(projectService.findById(id)));
    }

    @PostMapping
    public ResponseEntity<ProjectResponse> create(@Valid @RequestBody CreateProjectRequest request) {
        ProjectEntity created = projectService.create(request);
        URI location = URI.create("/api/v1/projects/" + created.getId());
        return ResponseEntity.created(location).body(ProjectResponse.from(created));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<ProjectResponse> update(@PathVariable Long id,
                                                   @Valid @RequestBody UpdateProjectRequest request) {
        return ResponseEntity.ok(ProjectResponse.from(projectService.update(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        projectService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
