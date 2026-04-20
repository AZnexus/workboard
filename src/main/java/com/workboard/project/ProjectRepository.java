package com.workboard.project;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {

    List<ProjectEntity> findByActiveTrueOrderByNameAsc();

    List<ProjectEntity> findAllByOrderByNameAsc();

    Optional<ProjectEntity> findByName(String name);
}
