package com.workboard.project;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProjectService {

    private final ProjectRepository projectRepository;

    public ProjectService(ProjectRepository projectRepository) {
        this.projectRepository = projectRepository;
    }

    @Transactional(readOnly = true)
    public List<ProjectEntity> findAll() {
        return projectRepository.findAllByOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public List<ProjectEntity> findActive() {
        return projectRepository.findByActiveTrueOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public ProjectEntity findById(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ProjectNotFoundException(id));
    }

    @Transactional
    public ProjectEntity create(CreateProjectRequest request) {
        projectRepository.findByName(request.name()).ifPresent(existing -> {
            throw new IllegalArgumentException("Project already exists: " + request.name());
        });
        ProjectEntity entity = new ProjectEntity();
        entity.setName(request.name());
        entity.setDescription(request.description());
        entity.setColor(request.color());
        return projectRepository.save(entity);
    }

    @Transactional
    public ProjectEntity update(Long id, UpdateProjectRequest request) {
        ProjectEntity entity = findById(id);
        if (request.name() != null) entity.setName(request.name());
        if (request.description() != null) entity.setDescription(request.description());
        if (request.color() != null) entity.setColor(request.color());
        if (request.active() != null) entity.setActive(request.active());
        return projectRepository.save(entity);
    }

    @Transactional
    public void delete(Long id) {
        ProjectEntity entity = findById(id);
        projectRepository.delete(entity);
    }
}
