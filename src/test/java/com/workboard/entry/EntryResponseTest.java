package com.workboard.entry;

import com.workboard.tag.TagEntity;
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
}
