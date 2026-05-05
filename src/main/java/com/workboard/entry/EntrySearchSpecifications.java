package com.workboard.entry;

import org.springframework.data.jpa.domain.Specification;

final class EntrySearchSpecifications {

    private EntrySearchSpecifications() {
    }

    static Specification<EntryEntity> fromCriteria(EntrySearchCriteria criteria) {
        Specification<EntryEntity> spec = Specification.where(null);

        if (criteria.date() != null) {
            spec = spec.and(EntrySpecifications.hasDate(criteria.date()));
        } else if (criteria.dateFrom() != null && criteria.dateTo() != null) {
            spec = spec.and(EntrySpecifications.dateBetween(criteria.dateFrom(), criteria.dateTo()));
        }
        if (criteria.status() != null) {
            spec = spec.and(EntrySpecifications.hasStatus(criteria.status()));
        }
        if (criteria.type() != null) {
            spec = spec.and(EntrySpecifications.hasType(criteria.type()));
        }
        if (criteria.tag() != null) {
            spec = spec.and(EntrySpecifications.hasTag(criteria.tag()));
        }
        if (Boolean.TRUE.equals(criteria.pinned())) {
            spec = spec.and(EntrySpecifications.isPinned());
        }
        if (criteria.priority() != null) {
            spec = spec.and(EntrySpecifications.hasPriority(criteria.priority()));
        }
        if (criteria.query() != null && !criteria.query().isBlank()) {
            spec = spec.and(EntrySpecifications.titleOrBodyContains(criteria.query().trim()));
        }

        return spec;
    }
}
