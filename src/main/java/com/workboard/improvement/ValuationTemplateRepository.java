package com.workboard.improvement;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ValuationTemplateRepository extends JpaRepository<ValuationTemplateEntity, Long> {

    List<ValuationTemplateEntity> findAllByOrderByNameAsc();

    Optional<ValuationTemplateEntity> findByNameIgnoreCase(String name);

    Optional<ValuationTemplateEntity> findByIsDefaultTrue();

    Optional<ValuationTemplateEntity> findFirstByIdNotOrderByIdAsc(Long id);
}
