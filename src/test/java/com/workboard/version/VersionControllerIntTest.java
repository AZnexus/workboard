package com.workboard.version;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:sqlite::memory:",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
class VersionControllerIntTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void create_rejectsCaseInsensitiveDuplicateName() throws Exception {
        mockMvc.perform(post("/api/v1/versions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateVersionRequest("Release 1", null))))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Release 1"))
                .andExpect(jsonPath("$.color").value("#6B7280"));

        mockMvc.perform(post("/api/v1/versions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateVersionRequest("release 1", null))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("conflict"))
                .andExpect(jsonPath("$.error.message").value("Version already exists: release 1"));
    }

    @Test
    void update_rejectsCaseInsensitiveDuplicateName() throws Exception {
        String firstName = "version-" + UUID.randomUUID();
        String secondName = "version-" + UUID.randomUUID();

        String firstLocation = mockMvc.perform(post("/api/v1/versions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateVersionRequest(firstName, null))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        String secondLocation = mockMvc.perform(post("/api/v1/versions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateVersionRequest(secondName, null))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        mockMvc.perform(patch(secondLocation)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateVersionRequest(firstName, null, null))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("conflict"))
                .andExpect(jsonPath("$.error.message").value("Version already exists: " + firstName));

        mockMvc.perform(patch(firstLocation)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateVersionRequest(firstName, false, "#F59E0B"))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false))
                .andExpect(jsonPath("$.color").value("#F59E0B"));
    }

    @Test
    void update_rejectsBlankName() throws Exception {
        String versionName = "version-" + UUID.randomUUID();

        String location = mockMvc.perform(post("/api/v1/versions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateVersionRequest(versionName, null))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        mockMvc.perform(patch(location)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateVersionRequest("   ", null, null))))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("conflict"))
                .andExpect(jsonPath("$.error.message").value("Version name must not be blank"));
    }

    @Test
    void list_supportsActiveFilter() throws Exception {
        String firstLocation = mockMvc.perform(post("/api/v1/versions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateVersionRequest("3.0", null))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        mockMvc.perform(post("/api/v1/versions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new CreateVersionRequest("4.0", "#0EA5E9"))))
                .andExpect(status().isCreated());

        mockMvc.perform(patch(firstLocation)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new UpdateVersionRequest(null, false, null))))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        mockMvc.perform(get("/api/v1/versions").param("active", "true"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name == '4.0')].active").value(org.hamcrest.Matchers.contains(true)))
                .andExpect(jsonPath("$[?(@.name == '4.0')].color").value(org.hamcrest.Matchers.contains("#0EA5E9")))
                .andExpect(jsonPath("$[?(@.name == '3.0')]").isEmpty());
    }

    @Test
    void create_acceptsExplicitColor() throws Exception {
        mockMvc.perform(post("/api/v1/versions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"5.0","color":"#2563EB"}
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("5.0"))
                .andExpect(jsonPath("$.color").value("#2563EB"));
    }
}
