package com.workboard.entry;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;

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

    @Test
    void createAndGet_returnsCreatedEntry() throws Exception {
        CreateEntryRequest request = new CreateEntryRequest(
                EntryType.TASK, "Integration test task", "body text",
                null, LocalDate.of(2026, 4, 17), List.of("work"), null);

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
                null, LocalDate.of(2026, 4, 17), List.of(), null);

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
}
