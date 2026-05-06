package com.workboard.entry;

import com.workboard.config.JpaConfig;
import com.workboard.tag.TagEntity;
import com.workboard.tag.TagRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import(JpaConfig.class)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:sqlite::memory:",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
class EntryRepositoryIntTest {

    @Autowired
    private EntryRepository entryRepository;

    @Autowired
    private TagRepository tagRepository;

    @Autowired
    private EntityManager entityManager;

    @Test
    void saveAndRetrieve() {
        EntryEntity entry = new EntryEntity();
        entry.setType(EntryType.TASK);
        entry.setTitle("Test task");
        entry.setStatus(EntryStatus.OPEN);
        entry.setDate(LocalDate.of(2026, 4, 17));

        EntryEntity saved = entryRepository.save(entry);

        Optional<EntryEntity> found = entryRepository.findById(saved.getId());
        assertThat(found).isPresent();
        assertThat(found.get().getTitle()).isEqualTo("Test task");
        assertThat(found.get().getType()).isEqualTo(EntryType.TASK);
    }

    @Test
    void findByDate() {
        LocalDate today = LocalDate.of(2026, 4, 17);
        LocalDate yesterday = today.minusDays(1);

        EntryEntity e1 = new EntryEntity();
        e1.setType(EntryType.NOTE);
        e1.setTitle("Today's note");
        e1.setStatus(EntryStatus.OPEN);
        e1.setDate(today);

        EntryEntity e2 = new EntryEntity();
        e2.setType(EntryType.TASK);
        e2.setTitle("Yesterday's task");
        e2.setStatus(EntryStatus.DONE);
        e2.setDate(yesterday);

        entryRepository.save(e1);
        entryRepository.save(e2);

        List<EntryEntity> results = entryRepository.findByDateOrderByPinnedDescCreatedAtDesc(today);
        assertThat(results).hasSize(1);
        assertThat(results.get(0).getTitle()).isEqualTo("Today's note");
    }

    @Test
    void findByTypeAndStatusInOrderByPriorityAscCreatedAtDesc_returnsAllActiveTasksRegardlessOfDueDate() {
        LocalDate selectedDate = LocalDate.of(2026, 4, 24);

        EntryEntity futureTask = new EntryEntity();
        futureTask.setType(EntryType.TASK);
        futureTask.setTitle("Future task");
        futureTask.setStatus(EntryStatus.OPEN);
        futureTask.setDate(selectedDate);
        futureTask.setDueDate(selectedDate.plusDays(1));
        futureTask.setCreatedAt(Instant.parse("2026-04-24T10:15:30Z"));
        futureTask.setUpdatedAt(Instant.parse("2026-04-24T10:15:30Z"));

        EntryEntity pastTask = new EntryEntity();
        pastTask.setType(EntryType.TASK);
        pastTask.setTitle("Past task");
        pastTask.setStatus(EntryStatus.IN_PROGRESS);
        pastTask.setDate(selectedDate);
        pastTask.setDueDate(selectedDate.minusDays(2));
        pastTask.setCreatedAt(Instant.parse("2026-04-24T09:15:30Z"));
        pastTask.setUpdatedAt(Instant.parse("2026-04-24T09:15:30Z"));

        EntryEntity todayTask = new EntryEntity();
        todayTask.setType(EntryType.TASK);
        todayTask.setTitle("Today task");
        todayTask.setStatus(EntryStatus.OPEN);
        todayTask.setDate(selectedDate);
        todayTask.setDueDate(selectedDate);
        todayTask.setCreatedAt(Instant.parse("2026-04-24T08:15:30Z"));
        todayTask.setUpdatedAt(Instant.parse("2026-04-24T08:15:30Z"));

        EntryEntity doneTask = new EntryEntity();
        doneTask.setType(EntryType.TASK);
        doneTask.setTitle("Done task");
        doneTask.setStatus(EntryStatus.DONE);
        doneTask.setDate(selectedDate);
        doneTask.setDueDate(selectedDate.plusDays(3));
        doneTask.setCreatedAt(Instant.parse("2026-04-24T07:15:30Z"));
        doneTask.setUpdatedAt(Instant.parse("2026-04-24T07:15:30Z"));

        entryRepository.save(futureTask);
        entryRepository.save(pastTask);
        entryRepository.save(todayTask);
        entryRepository.save(doneTask);

        List<EntryEntity> results = entryRepository.findByTypeAndStatusInOrderByPriorityAscCreatedAtDesc(
                EntryType.TASK,
                List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS, EntryStatus.PAUSED));

        assertThat(results)
                .extracting(EntryEntity::getTitle)
                .containsExactly("Today task", "Past task", "Future task");
    }

    @Test
    void findByIdWithTags_returnsEntryWithTagRelations() {
        TagEntity tag = new TagEntity();
        tag.setName("backend-repository");
        tag.setColor("#123456");
        TagEntity savedTag = tagRepository.save(tag);

        EntryEntity entry = new EntryEntity();
        entry.setType(EntryType.TASK);
        entry.setTitle("Tagged repository entry");
        entry.setStatus(EntryStatus.OPEN);
        entry.setDate(LocalDate.of(2026, 4, 18));
        entry.addTag(savedTag);

        EntryEntity saved = entryRepository.save(entry);

        Optional<EntryEntity> found = entryRepository.findByIdWithTags(saved.getId());

        assertThat(found).isPresent();
        assertThat(found.get().getTags()).hasSize(1);
        assertThat(found.get().getTags().get(0).getTag()).isEqualTo("backend-repository");
        assertThat(found.get().getTags().get(0).getTagEntity()).isNotNull();
        assertThat(found.get().getTags().get(0).getTagEntity().getColor()).isEqualTo("#123456");
    }

    @Test
    void findAllWithTags_specificationAndPaging_returnsTaggedEntries() {
        TagEntity tag = new TagEntity();
        tag.setName("search-tag");
        tag.setColor("#22C55E");
        TagEntity savedTag = tagRepository.save(tag);

        EntryEntity matching = new EntryEntity();
        matching.setType(EntryType.TASK);
        matching.setTitle("Needle task");
        matching.setStatus(EntryStatus.OPEN);
        matching.setDate(LocalDate.of(2026, 4, 19));
        matching.addTag(savedTag);

        EntryEntity nonMatching = new EntryEntity();
        nonMatching.setType(EntryType.NOTE);
        nonMatching.setTitle("Haystack note");
        nonMatching.setStatus(EntryStatus.OPEN);
        nonMatching.setDate(LocalDate.of(2026, 4, 19));

        entryRepository.save(matching);
        entryRepository.save(nonMatching);

        EntrySearchCriteria criteria = new EntrySearchCriteria(
                null,
                null,
                null,
                EntryStatus.OPEN,
                EntryType.TASK,
                "search-tag",
                null,
                null,
                "Needle"
        );

        Page<EntryEntity> result = entryRepository.findAllWithTags(
                EntrySearchSpecifications.fromCriteria(criteria),
                PageRequest.of(0, 10)
        );

        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getTitle()).isEqualTo("Needle task");
        assertThat(result.getContent().get(0).getTags()).hasSize(1);
        assertThat(result.getContent().get(0).getTags().get(0).getTag()).isEqualTo("search-tag");
        assertThat(result.getContent().get(0).getTags().get(0).getTagEntity()).isNotNull();
    }

    @Test
    void findById_plainLookup_doesNotPreloadTags() {
        TagEntity tag = new TagEntity();
        tag.setName("lazy-check-tag");
        tag.setColor("#334155");
        TagEntity savedTag = tagRepository.save(tag);

        EntryEntity entry = new EntryEntity();
        entry.setType(EntryType.TASK);
        entry.setTitle("Lazy check entry");
        entry.setStatus(EntryStatus.OPEN);
        entry.setDate(LocalDate.of(2026, 4, 26));
        entry.addTag(savedTag);

        EntryEntity saved = entryRepository.save(entry);
        entityManager.flush();
        entityManager.clear();

        Optional<EntryEntity> found = entryRepository.findById(saved.getId());

        assertThat(found).isPresent();
        assertThat(entityManager.getEntityManagerFactory().getPersistenceUnitUtil().isLoaded(found.get(), "tags"))
                .isFalse();
    }

    @Test
    void findByDateOrderByPinnedDescCreatedAtDescWithTags_returnsOrderedEntriesWithTagRelations() {
        LocalDate date = LocalDate.of(2026, 4, 24);

        TagEntity pinnedTag = new TagEntity();
        pinnedTag.setName("date-query-tag");
        pinnedTag.setColor("#38BDF8");
        TagEntity savedPinnedTag = tagRepository.save(pinnedTag);

        EntryEntity pinnedEntry = new EntryEntity();
        pinnedEntry.setType(EntryType.NOTE);
        pinnedEntry.setTitle("Pinned note");
        pinnedEntry.setStatus(EntryStatus.OPEN);
        pinnedEntry.setDate(date);
        pinnedEntry.setPinned(true);
        pinnedEntry.setCreatedAt(Instant.parse("2026-04-24T10:15:30Z"));
        pinnedEntry.setUpdatedAt(Instant.parse("2026-04-24T10:15:30Z"));
        pinnedEntry.addTag(savedPinnedTag);

        EntryEntity regularEntry = new EntryEntity();
        regularEntry.setType(EntryType.NOTE);
        regularEntry.setTitle("Regular note");
        regularEntry.setStatus(EntryStatus.OPEN);
        regularEntry.setDate(date);
        regularEntry.setPinned(false);
        regularEntry.setCreatedAt(Instant.parse("2026-04-24T09:15:30Z"));
        regularEntry.setUpdatedAt(Instant.parse("2026-04-24T09:15:30Z"));

        entryRepository.save(pinnedEntry);
        entryRepository.save(regularEntry);

        List<EntryEntity> result = entryRepository.findByDateOrderByPinnedDescCreatedAtDescWithTags(date);

        assertThat(result).extracting(EntryEntity::getTitle).containsExactly("Pinned note", "Regular note");
        assertThat(result.get(0).getTags()).hasSize(1);
        assertThat(result.get(0).getTags().get(0).getTag()).isEqualTo("date-query-tag");
        assertThat(result.get(0).getTags().get(0).getTagEntity()).isNotNull();
    }

    @Test
    void findByTypeAndStatusInOrderByPriorityAscCreatedAtDescWithTags_returnsOrderedTaggedEntries() {
        TagEntity tag = new TagEntity();
        tag.setName("task-query-tag");
        tag.setColor("#F97316");
        TagEntity savedTag = tagRepository.save(tag);

        EntryEntity highestPriority = new EntryEntity();
        highestPriority.setType(EntryType.TASK);
        highestPriority.setTitle("Highest priority task");
        highestPriority.setStatus(EntryStatus.OPEN);
        highestPriority.setDate(LocalDate.of(2026, 4, 24));
        highestPriority.setPriority(1);
        highestPriority.setCreatedAt(Instant.parse("2026-04-24T10:15:30Z"));
        highestPriority.setUpdatedAt(Instant.parse("2026-04-24T10:15:30Z"));
        highestPriority.addTag(savedTag);

        EntryEntity lowerPriority = new EntryEntity();
        lowerPriority.setType(EntryType.TASK);
        lowerPriority.setTitle("Lower priority task");
        lowerPriority.setStatus(EntryStatus.IN_PROGRESS);
        lowerPriority.setDate(LocalDate.of(2026, 4, 24));
        lowerPriority.setPriority(2);
        lowerPriority.setCreatedAt(Instant.parse("2026-04-24T09:15:30Z"));
        lowerPriority.setUpdatedAt(Instant.parse("2026-04-24T09:15:30Z"));

        EntryEntity doneTask = new EntryEntity();
        doneTask.setType(EntryType.TASK);
        doneTask.setTitle("Done task");
        doneTask.setStatus(EntryStatus.DONE);
        doneTask.setDate(LocalDate.of(2026, 4, 24));
        doneTask.setPriority(0);

        entryRepository.save(highestPriority);
        entryRepository.save(lowerPriority);
        entryRepository.save(doneTask);

        List<EntryEntity> result = entryRepository.findByTypeAndStatusInOrderByPriorityAscCreatedAtDescWithTags(
                EntryType.TASK,
                List.of(EntryStatus.OPEN, EntryStatus.IN_PROGRESS, EntryStatus.PAUSED)
        );

        assertThat(result).extracting(EntryEntity::getTitle).containsExactly("Highest priority task", "Lower priority task");
        assertThat(result.get(0).getTags()).hasSize(1);
        assertThat(result.get(0).getTags().get(0).getTag()).isEqualTo("task-query-tag");
        assertThat(result.get(0).getTags().get(0).getTagEntity()).isNotNull();
    }

    @Test
    void findByTypeAndStatusOrderByCreatedAtDescWithTags_returnsTaggedEntries() {
        TagEntity tag = new TagEntity();
        tag.setName("reminder-query-tag");
        tag.setColor("#A855F7");
        TagEntity savedTag = tagRepository.save(tag);

        EntryEntity reminder = new EntryEntity();
        reminder.setType(EntryType.REMINDER);
        reminder.setTitle("Reminder with tag");
        reminder.setStatus(EntryStatus.OPEN);
        reminder.setDate(LocalDate.of(2026, 4, 24));
        reminder.setCreatedAt(Instant.parse("2026-04-24T08:15:30Z"));
        reminder.setUpdatedAt(Instant.parse("2026-04-24T08:15:30Z"));
        reminder.addTag(savedTag);

        entryRepository.save(reminder);

        List<EntryEntity> result = entryRepository.findByTypeAndStatusOrderByCreatedAtDescWithTags(
                EntryType.REMINDER,
                EntryStatus.OPEN
        );

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitle()).isEqualTo("Reminder with tag");
        assertThat(result.get(0).getTags()).hasSize(1);
        assertThat(result.get(0).getTags().get(0).getTag()).isEqualTo("reminder-query-tag");
        assertThat(result.get(0).getTags().get(0).getTagEntity()).isNotNull();
    }
}
