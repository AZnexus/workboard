package com.workboard.entry;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.List;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:sqlite::memory:",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
class EntryControllerIntTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TagRepository tagRepository;

    @Test
    void createAndGet_returnsCreatedEntry() throws Exception {
        CreateEntryRequest request = new CreateEntryRequest(
                EntryType.TASK, "Integration test task", "body text",
                null, LocalDate.of(2026, 4, 17), null, null, List.of(), null, null);

        String location = mockMvc.perform(post("/api/v1/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Integration test task"))
                .andExpect(jsonPath("$.type").value("TASK"))
                .andReturn()
                .getResponse()
                .getHeader("Location");

        mockMvc.perform(get(location))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Integration test task"));
    }

    @Test
    void getById_notFound_returns404() throws Exception {
        mockMvc.perform(get("/api/v1/entries/999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("not_found"));
    }

    @Test
    void create_missingTitle_returns422() throws Exception {
        String body = """
                {"type": "TASK"}
                """;

        mockMvc.perform(post("/api/v1/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isUnprocessableEntity())
                .andExpect(jsonPath("$.error.code").value("validation_error"));
    }

    @Test
    void delete_existingEntry_returns204() throws Exception {
        CreateEntryRequest request = new CreateEntryRequest(
                EntryType.NOTE, "To be deleted", null,
                null, LocalDate.of(2026, 4, 17), null, null, List.of(), null, null);

        String location = mockMvc.perform(post("/api/v1/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        mockMvc.perform(delete(location))
                .andExpect(status().isNoContent());

        mockMvc.perform(get(location))
                .andExpect(status().isNotFound());
    }

    @Test
    void patch_dueDateNull_clearsDueDate() throws Exception {
        CreateEntryRequest request = new CreateEntryRequest(
                EntryType.TASK, "Scheduled task", null,
                null, LocalDate.of(2026, 4, 24), LocalDate.of(2026, 4, 24), null, List.of(), null, 4);

        String location = mockMvc.perform(post("/api/v1/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.due_date").value("2026-04-24"))
                .andReturn()
                .getResponse()
                .getHeader("Location");

        String patchBody = """
                {"dueDate": null}
                """;

        mockMvc.perform(patch(location)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patchBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.due_date").doesNotExist());
    }

    @Test
    void create_andPatch_scheduledTodayRoundTrips() throws Exception {
        String createBody = """
                {"type":"TASK","title":"Today task","scheduledToday":true}
                """;

        String location = mockMvc.perform(post("/api/v1/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.scheduled_today").value(true))
                .andReturn()
                .getResponse()
                .getHeader("Location");

        mockMvc.perform(get(location))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scheduled_today").value(true));

        String patchBody = """
                {"scheduledToday": false}
                """;

        mockMvc.perform(patch(location)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patchBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scheduled_today").value(false));
    }

    @Test
    void patch_missingScheduledTodayDoesNotClearIt() throws Exception {
        String createBody = """
                {"type":"TASK","title":"Sticky today task","scheduledToday":true}
                """;

        String location = mockMvc.perform(post("/api/v1/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(createBody))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        String patchBody = """
                {"title":"Still today"}
                """;

        mockMvc.perform(patch(location)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patchBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.scheduled_today").value(true));
    }

    @Test
    void list_returnsPinnedEntriesFirstByDefaultSort() throws Exception {
        String pinnedLocation = createEntry("""
                {"type":"TASK","title":"Pinned first"}
                """);
        createEntry("""
                {"type":"TASK","title":"Regular second"}
                """);

        mockMvc.perform(patch(pinnedLocation)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"pinned": true}
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pinned").value(true));

        mockMvc.perform(get("/api/v1/entries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[0].title").value("Pinned first"))
                .andExpect(jsonPath("$.data[0].pinned").value(true));
    }

    @Test
    void list_filtersByPinnedAndQueryWithoutChangingResponseShape() throws Exception {
        String matchingLocation = createEntry("""
                {"type":"TASK","title":"Needle pinned task"}
                """);
        createEntry("""
                {"type":"TASK","title":"Haystack task"}
                """);

        mockMvc.perform(patch(matchingLocation)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"pinned": true}
                                """))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/v1/entries")
                        .param("pinned", "true")
                        .param("q", " needle "))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meta.total").value(1))
                .andExpect(jsonPath("$.data[0].title").value("Needle pinned task"))
                .andExpect(jsonPath("$.data[0].pinned").value(true));
    }

    @Test
    void createGetAndList_serializeTagsInResponses() throws Exception {
        Long tagId = createTag("backend", "#123456");

        CreateEntryRequest request = new CreateEntryRequest(
                EntryType.TASK, "Tagged task", "body text",
                null, LocalDate.of(2026, 4, 18), null, null, List.of(tagId), null, null);

        String location = mockMvc.perform(post("/api/v1/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.tags[0].name").value("backend"))
                .andExpect(jsonPath("$.tags[0].color").value("#123456"))
                .andReturn()
                .getResponse()
                .getHeader("Location");

        mockMvc.perform(get(location))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tags[0].name").value("backend"))
                .andExpect(jsonPath("$.tags[0].color").value("#123456"));

        mockMvc.perform(get("/api/v1/entries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data[?(@.title == 'Tagged task')].tags[0].name").value(org.hamcrest.Matchers.contains("backend")))
                .andExpect(jsonPath("$.data[?(@.title == 'Tagged task')].tags[0].color").value(org.hamcrest.Matchers.contains("#123456")));
    }

    @Test
    void patch_updatesSerializedTagsInResponse() throws Exception {
        Long initialTagId = createTag("backend-" + UUID.randomUUID(), "#123456");
        Long replacementTagId = createTag("urgent-" + UUID.randomUUID(), "#FF0000");

        CreateEntryRequest request = new CreateEntryRequest(
                EntryType.TASK, "Retag me", null,
                null, LocalDate.of(2026, 4, 19), null, null, List.of(initialTagId), null, null);

        String location = mockMvc.perform(post("/api/v1/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        String patchBody = """
                {"tagIds":[%d]}
                """.formatted(replacementTagId);

        mockMvc.perform(patch(location)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(patchBody))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tags", org.hamcrest.Matchers.hasSize(1)))
                .andExpect(jsonPath("$.tags[0].name").value(org.hamcrest.Matchers.startsWith("urgent-")))
                .andExpect(jsonPath("$.tags[0].color").value("#FF0000"));

        mockMvc.perform(get(location))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tags", org.hamcrest.Matchers.hasSize(1)))
                .andExpect(jsonPath("$.tags[0].name").value(org.hamcrest.Matchers.startsWith("urgent-")));
    }

    private Long createTag(String name, String color) {
        TagEntity tag = new TagEntity();
        tag.setName(name);
        tag.setColor(color);
        return tagRepository.save(tag).getId();
    }

    private String createEntry(String body) throws Exception {
        return mockMvc.perform(post("/api/v1/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(body))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");
    }
}
