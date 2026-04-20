package com.workboard.entry;

import jakarta.persistence.criteria.Join;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class EntrySpecifications {

    private EntrySpecifications() {}

    public static Specification<EntryEntity> hasDate(LocalDate date) {
        return (root, query, cb) -> cb.equal(root.get("date"), date);
    }

    public static Specification<EntryEntity> dateBetween(LocalDate from, LocalDate to) {
        return (root, query, cb) -> cb.between(root.get("date"), from, to);
    }

    public static Specification<EntryEntity> hasStatus(EntryStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<EntryEntity> hasType(EntryType type) {
        return (root, query, cb) -> cb.equal(root.get("type"), type);
    }

    public static Specification<EntryEntity> isPinned() {
        return (root, query, cb) -> cb.isTrue(root.get("pinned"));
    }

    public static Specification<EntryEntity> hasTag(String tag) {
        return (root, query, cb) -> {
            Join<EntryEntity, EntryTagEntity> tags = root.join("tags");
            query.distinct(true);
            return cb.equal(tags.get("tagEntity").get("name"), tag);
        };
    }

    public static Specification<EntryEntity> titleOrBodyContains(String search) {
        return (root, query, cb) -> {
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("body")), pattern)
            );
        };
    }

    public static Specification<EntryEntity> hasPriority(Integer priority) {
        return (root, query, cb) -> cb.equal(root.get("priority"), priority);
    }
}
