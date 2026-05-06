package com.workboard.entry;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.Collection;
import java.util.List;

public interface EntryRepository extends JpaRepository<EntryEntity, Long>,
        org.springframework.data.jpa.repository.JpaSpecificationExecutor<EntryEntity>, EntryRepositoryWithTags {

    @EntityGraph(attributePaths = {EntryQueryPaths.TAGS, EntryQueryPaths.TAGS + "." + EntryQueryPaths.TAG_ENTITY})
    @Query("select e from EntryEntity e where e.id = :id")
    java.util.Optional<EntryEntity> findByIdWithTags(@Param("id") Long id);

    @EntityGraph(attributePaths = {EntryQueryPaths.TAGS, EntryQueryPaths.TAGS + "." + EntryQueryPaths.TAG_ENTITY})
    @Query("select e from EntryEntity e")
    Page<EntryEntity> findAllWithTags(Pageable pageable);

    @EntityGraph(attributePaths = {EntryQueryPaths.TAGS, EntryQueryPaths.TAGS + "." + EntryQueryPaths.TAG_ENTITY})
    @Query("""
            select e
            from EntryEntity e
            where e.date = :date
            order by e.pinned desc, e.createdAt desc
            """)
    List<EntryEntity> findByDateOrderByPinnedDescCreatedAtDescWithTags(@Param("date") LocalDate date);

    @EntityGraph(attributePaths = {EntryQueryPaths.TAGS, EntryQueryPaths.TAGS + "." + EntryQueryPaths.TAG_ENTITY})
    @Query("""
            select e
            from EntryEntity e
            where e.type = :type and e.status in :statuses
            order by e.priority asc, e.createdAt desc
            """)
    List<EntryEntity> findByTypeAndStatusInOrderByPriorityAscCreatedAtDescWithTags(
            @Param("type") EntryType type,
            @Param("statuses") Collection<EntryStatus> statuses
    );

    @EntityGraph(attributePaths = {EntryQueryPaths.TAGS, EntryQueryPaths.TAGS + "." + EntryQueryPaths.TAG_ENTITY})
    @Query("""
            select e
            from EntryEntity e
            where e.type = :type and e.status = :status
            order by e.createdAt desc
            """)
    List<EntryEntity> findByTypeAndStatusOrderByCreatedAtDescWithTags(
            @Param("type") EntryType type,
            @Param("status") EntryStatus status
    );

    Page<EntryEntity> findByDate(LocalDate date, Pageable pageable);

    Page<EntryEntity> findByDateBetween(LocalDate from, LocalDate to, Pageable pageable);

    Page<EntryEntity> findByType(EntryType type, Pageable pageable);

    Page<EntryEntity> findByStatus(EntryStatus status, Pageable pageable);

    Page<EntryEntity> findByPinnedTrue(Pageable pageable);

    List<EntryEntity> findByDateAndStatusIn(LocalDate date, Collection<EntryStatus> statuses);

    @Query("SELECT e FROM EntryEntity e JOIN e.tags t WHERE t.tag = :tag")
    Page<EntryEntity> findByTag(@Param("tag") String tag, Pageable pageable);

    List<EntryEntity> findByDateOrderByPinnedDescCreatedAtDesc(LocalDate date);

    List<EntryEntity> findByStatusInAndDateBeforeOrderByDateDescCreatedAtDesc(
            Collection<EntryStatus> statuses, LocalDate beforeDate);

    List<EntryEntity> findByTypeAndDueDateIsNullAndStatusInOrderByPriorityAscCreatedAtDesc(
            EntryType type, Collection<EntryStatus> statuses);

    List<EntryEntity> findByTypeAndStatusInOrderByPriorityAscCreatedAtDesc(
            EntryType type, Collection<EntryStatus> statuses);

    List<EntryEntity> findByDueDateAndStatusInOrderByPriorityAscCreatedAtDesc(
            LocalDate dueDate, Collection<EntryStatus> statuses);

    List<EntryEntity> findByTypeAndStatusOrderByCreatedAtDesc(EntryType type, EntryStatus status);
}
