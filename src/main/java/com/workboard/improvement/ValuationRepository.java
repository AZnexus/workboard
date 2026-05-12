package com.workboard.improvement;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface ValuationRepository extends JpaRepository<ValuationEntity, Long> {

    @EntityGraph(attributePaths = {"improvement", "improvement.tags", "improvement.tags.tagEntity", "version"})
    Optional<ValuationEntity> findByImprovementId(Long improvementId);

    boolean existsByImprovementId(Long improvementId);
}
