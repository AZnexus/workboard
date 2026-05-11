package com.workboard.version;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface VersionRepository extends JpaRepository<VersionEntity, Long> {

    List<VersionEntity> findByActiveTrueOrderByNameAsc();

    List<VersionEntity> findAllByOrderByNameAsc();

    Optional<VersionEntity> findByNameIgnoreCase(String name);
}
