package com.workboard.entry;

import com.workboard.improvement.ImprovementEntity;
import com.workboard.tag.TagEntity;
import com.workboard.version.VersionEntity;
import org.junit.jupiter.api.Test;

import java.time.Instant;

import static org.assertj.core.api.Assertions.assertThat;

class EntryResponseTest {

    @Test
    void from_mapsLinkedTagEntityFields() {
        EntryEntity entry = new EntryEntity();
        TagEntity tag = new TagEntity();
        tag.setId(7L);
        tag.setName("backend");
        tag.setColor("#123456");
        tag.setCreatedAt(Instant.parse("2026-05-01T10:15:30Z"));

        entry.addTag(tag);

        EntryResponse response = EntryResponse.from(entry);

        assertThat(response.tags()).hasSize(1);
        assertThat(response.tags().get(0).id()).isEqualTo(7L);
        assertThat(response.tags().get(0).name()).isEqualTo("backend");
        assertThat(response.tags().get(0).color()).isEqualTo("#123456");
        assertThat(response.tags().get(0).createdAt()).isEqualTo(Instant.parse("2026-05-01T10:15:30Z"));
    }

    @Test
    void from_fallsBackToStoredTagWhenLinkedEntityMissing() {
        EntryEntity entry = new EntryEntity();
        EntryTagEntity entryTag = new EntryTagEntity();
        entryTag.setEntry(entry);
        entryTag.setTag("legacy-tag");
        entry.getTags().add(entryTag);

        EntryResponse response = EntryResponse.from(entry);

        assertThat(response.tags()).hasSize(1);
        assertThat(response.tags().get(0).id()).isNull();
        assertThat(response.tags().get(0).name()).isEqualTo("legacy-tag");
        assertThat(response.tags().get(0).color()).isEqualTo("#6B7280");
        assertThat(response.tags().get(0).createdAt()).isNull();
    }

    @Test
    void from_mapsVersionWhenPresent() {
        EntryEntity entry = new EntryEntity();
        VersionEntity version = new VersionEntity();
        version.setId(3L);
        version.setName("2026.05");
        version.setColor("#0EA5E9");
        version.setActive(true);
        version.setCreatedAt(Instant.parse("2026-05-01T10:15:30Z"));
        entry.setVersion(version);

        EntryResponse response = EntryResponse.from(entry);

        assertThat(response.version()).isNotNull();
        assertThat(response.version().id()).isEqualTo(3L);
        assertThat(response.version().name()).isEqualTo("2026.05");
        assertThat(response.version().color()).isEqualTo("#0EA5E9");
        assertThat(response.version().active()).isTrue();
        assertThat(response.version().createdAt()).isEqualTo(Instant.parse("2026-05-01T10:15:30Z"));
    }

    @Test
    void from_mapsLinkedImprovementSummaryWhenPresent() {
        EntryEntity entry = new EntryEntity();
        ImprovementEntity improvement = new ImprovementEntity();
        improvement.setId(8L);
        improvement.setTitle("Millora resumida");
        entry.setImprovement(improvement);

        EntryResponse response = EntryResponse.from(entry);

        assertThat(response.linkedImprovement()).isNotNull();
        assertThat(response.linkedImprovement().id()).isEqualTo(8L);
        assertThat(response.linkedImprovement().title()).isEqualTo("Millora resumida");
    }
}
