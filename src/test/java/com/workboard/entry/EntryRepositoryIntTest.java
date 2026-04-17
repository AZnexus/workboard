package com.workboard.entry;

import com.workboard.config.JpaConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.TestPropertySource;

import java.time.LocalDate;
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
}
