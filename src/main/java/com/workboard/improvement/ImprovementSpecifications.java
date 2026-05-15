package com.workboard.improvement;

import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import org.springframework.data.jpa.domain.Specification;

import java.time.LocalDate;

public final class ImprovementSpecifications {

    private ImprovementSpecifications() {
    }

    public static Specification<ImprovementEntity> queryContains(String search) {
        return (root, query, cb) -> {
            String pattern = "%" + search.toLowerCase() + "%";
            return cb.or(
                    cb.like(cb.lower(root.get("title")), pattern),
                    cb.like(cb.lower(root.get("requirements")), pattern),
                    cb.like(cb.lower(root.get("redmineParentRef")), pattern),
                    cb.like(cb.lower(root.get("jiraRef")), pattern),
                    cb.like(cb.lower(root.get("noteContext")), pattern),
                    cb.like(cb.lower(root.get("noteRiskDependency")), pattern),
                    cb.like(cb.lower(root.get("noteObservations")), pattern)
            );
        };
    }

    public static Specification<ImprovementEntity> hasStatus(ImprovementStatus status) {
        return (root, query, cb) -> cb.equal(root.get("status"), status);
    }

    public static Specification<ImprovementEntity> hasPriority(Integer priority) {
        return (root, query, cb) -> cb.equal(root.get("priority"), priority);
    }

    public static Specification<ImprovementEntity> hasVersionId(Long versionId) {
        return (root, query, cb) -> cb.equal(root.get("version").get("id"), versionId);
    }

    public static Specification<ImprovementEntity> hasTag(String tag) {
        return (root, query, cb) -> {
            Join<ImprovementEntity, ImprovementTagEntity> tags = root.join("tags", JoinType.LEFT);
            query.distinct(true);
            return cb.equal(cb.lower(tags.get("tag")), tag.toLowerCase());
        };
    }

    public static Specification<ImprovementEntity> hasValuation(boolean hasValuation) {
        return (root, query, cb) -> {
            Join<ImprovementEntity, ValuationEntity> valuation = root.join("valuation", JoinType.LEFT);
            query.distinct(true);
            return hasValuation ? cb.isNotNull(valuation.get("id")) : cb.isNull(valuation.get("id"));
        };
    }

    public static Specification<ImprovementEntity> completionAtLeast(Integer completionFrom) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("completionPercentage"), completionFrom);
    }

    public static Specification<ImprovementEntity> completionAtMost(Integer completionTo) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("completionPercentage"), completionTo);
    }

    public static Specification<ImprovementEntity> dueDateFrom(LocalDate dueDateFrom) {
        return (root, query, cb) -> cb.greaterThanOrEqualTo(root.get("dueDate"), dueDateFrom);
    }

    public static Specification<ImprovementEntity> dueDateTo(LocalDate dueDateTo) {
        return (root, query, cb) -> cb.lessThanOrEqualTo(root.get("dueDate"), dueDateTo);
    }
}
