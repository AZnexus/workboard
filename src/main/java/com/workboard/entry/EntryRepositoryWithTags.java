package com.workboard.entry;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

public interface EntryRepositoryWithTags {

    Page<EntryEntity> findAllWithTags(Pageable pageable);

    Page<EntryEntity> findAllWithTags(Specification<EntryEntity> specification, Pageable pageable);
}
