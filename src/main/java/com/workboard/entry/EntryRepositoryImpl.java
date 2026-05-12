package com.workboard.entry;

import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Repository;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Repository
class EntryRepositoryImpl implements EntryRepositoryWithTags {

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    public Page<EntryEntity> findAllWithTags(Pageable pageable) {
        return findAllWithTags(null, pageable);
    }

    @Override
    public Page<EntryEntity> findAllWithTags(Specification<EntryEntity> specification, Pageable pageable) {
        CriteriaBuilder criteriaBuilder = entityManager.getCriteriaBuilder();

        CriteriaQuery<Long> countQuery = criteriaBuilder.createQuery(Long.class);
        Root<EntryEntity> countRoot = countQuery.from(EntryEntity.class);
        countQuery.select(criteriaBuilder.countDistinct(countRoot));

        Predicate countPredicate = buildPredicate(specification, criteriaBuilder, countQuery, countRoot);
        if (countPredicate != null) {
            countQuery.where(countPredicate);
        }

        Long total = entityManager.createQuery(countQuery).getSingleResult();
        if (total == 0) {
            return new PageImpl<>(List.of(), pageable, 0);
        }

        List<Long> pageIds = loadPageIds(specification, pageable, criteriaBuilder);
        if (pageIds.isEmpty()) {
            return new PageImpl<>(List.of(), pageable, total);
        }

        List<EntryEntity> content = loadEntriesWithTags(pageIds, criteriaBuilder);
        return new PageImpl<>(content, pageable, total);
    }

    private List<Long> loadPageIds(
            Specification<EntryEntity> specification,
            Pageable pageable,
            CriteriaBuilder criteriaBuilder
    ) {
        CriteriaQuery<Long> idQuery = criteriaBuilder.createQuery(Long.class);
        Root<EntryEntity> idRoot = idQuery.from(EntryEntity.class);
        idQuery.select(idRoot.get("id")).distinct(true);

        Predicate idPredicate = buildPredicate(specification, criteriaBuilder, idQuery, idRoot);
        if (idPredicate != null) {
            idQuery.where(idPredicate);
        }

        List<Order> orders = org.springframework.data.jpa.repository.query.QueryUtils.toOrders(pageable.getSort(), idRoot, criteriaBuilder);
        if (!orders.isEmpty()) {
            idQuery.orderBy(orders);
        }

        TypedQuery<Long> typedQuery = entityManager.createQuery(idQuery);
        typedQuery.setFirstResult((int) pageable.getOffset());
        typedQuery.setMaxResults(pageable.getPageSize());
        return typedQuery.getResultList();
    }

    private List<EntryEntity> loadEntriesWithTags(List<Long> ids, CriteriaBuilder criteriaBuilder) {
        CriteriaQuery<EntryEntity> contentQuery = criteriaBuilder.createQuery(EntryEntity.class);
        Root<EntryEntity> contentRoot = contentQuery.from(EntryEntity.class);
        contentRoot.fetch(EntryQueryPaths.TAGS, jakarta.persistence.criteria.JoinType.LEFT)
                .fetch(EntryQueryPaths.TAG_ENTITY, jakarta.persistence.criteria.JoinType.LEFT);
        contentRoot.fetch(EntryQueryPaths.VERSION, jakarta.persistence.criteria.JoinType.LEFT);
        contentRoot.fetch(EntryQueryPaths.IMPROVEMENT, jakarta.persistence.criteria.JoinType.LEFT);
        contentQuery.select(contentRoot).distinct(true);
        contentQuery.where(contentRoot.get("id").in(ids));

        List<EntryEntity> loadedEntries = entityManager.createQuery(contentQuery).getResultList();
        Map<Long, EntryEntity> entriesById = new LinkedHashMap<>();
        for (EntryEntity entry : loadedEntries) {
            entriesById.put(entry.getId(), entry);
        }

        List<EntryEntity> orderedEntries = new ArrayList<>();
        for (Long id : ids) {
            EntryEntity entry = entriesById.get(id);
            if (entry != null) {
                orderedEntries.add(entry);
            }
        }
        return orderedEntries;
    }

    private Predicate buildPredicate(
            Specification<EntryEntity> specification,
            CriteriaBuilder criteriaBuilder,
            CriteriaQuery<?> query,
            Root<EntryEntity> root
    ) {
        if (specification == null) {
            return null;
        }
        return specification.toPredicate(root, query, criteriaBuilder);
    }
}
