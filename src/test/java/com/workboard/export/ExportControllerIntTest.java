package com.workboard.export;

import com.workboard.entry.EntryEntity;
import com.workboard.entry.EntryRepository;
import com.workboard.entry.EntryStatus;
import com.workboard.entry.EntryType;
import com.workboard.tag.TagEntity;
import com.workboard.tag.TagRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:sqlite::memory:",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
class ExportControllerIntTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntryRepository entryRepository;

    @Autowired
    private TagRepository tagRepository;

    @Test
    void markdownDate_rendersHashtagsFromPersistedTags() throws Exception {
        LocalDate date = LocalDate.of(2026, 4, 25);
        String suffix = UUID.randomUUID().toString();
        String title = "Export tagged task " + suffix;
        String tagName = "export-tag-" + suffix;

        saveTaggedEntry(title, date, tagName, "#22C55E");

        mockMvc.perform(get("/api/v1/export/markdown").param("date", date.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("**%s** #%s".formatted(title, tagName))));
    }

    @Test
    void markdownDate_escapesUnsafeTagNames() throws Exception {
        LocalDate date = LocalDate.of(2026, 4, 26);
        String suffix = UUID.randomUUID().toString();
        String title = "Export unsafe tagged task " + suffix;
        String tagName = "unsafe<script>(x)_tag-" + suffix;

        saveTaggedEntry(title, date, tagName, "#22C55E");

        mockMvc.perform(get("/api/v1/export/markdown").param("date", date.toString()))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("**%s** #unsafe&lt;script&gt;\\(x\\)\\_tag-%s".formatted(title, suffix))));
    }

    private void saveTaggedEntry(String title, LocalDate date, String tagName, String color) {
        TagEntity tag = new TagEntity();
        tag.setName(tagName);
        tag.setColor(color);
        TagEntity savedTag = tagRepository.save(tag);

        EntryEntity entry = new EntryEntity();
        entry.setType(EntryType.TASK);
        entry.setTitle(title);
        entry.setStatus(EntryStatus.OPEN);
        entry.setDate(date);
        entry.addTag(savedTag);

        entryRepository.save(entry);
    }
}
