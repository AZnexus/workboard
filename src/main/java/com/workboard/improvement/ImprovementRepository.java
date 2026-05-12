package com.workboard.improvement;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface ImprovementRepository extends JpaRepository<ImprovementEntity, Long>, JpaSpecificationExecutor<ImprovementEntity> {

    @EntityGraph(attributePaths = {"tags", "tags.tagEntity", "version", "valuation"})
    @Query("select i from ImprovementEntity i where i.id = :id")
    Optional<ImprovementEntity> findByIdWithDetails(@Param("id") Long id);

    @Override
    @EntityGraph(attributePaths = {"tags", "tags.tagEntity", "version", "valuation"})
    Page<ImprovementEntity> findAll(Specification<ImprovementEntity> spec, Pageable pageable);

    Optional<ImprovementEntity> findByJiraRefIgnoreCase(String jiraRef);
}
