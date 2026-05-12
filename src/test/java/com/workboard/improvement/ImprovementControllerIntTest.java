package com.workboard.improvement;

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
class ImprovementControllerIntTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TagRepository tagRepository;

    @Test
    void createImprovement_persistsCoreFields() throws Exception {
        Long versionId = createVersion("2026.12");
        Long tagId = createTag("backend-improvement", "#123456");

        mockMvc.perform(post("/api/v1/improvements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Millora backend",
                                  "requirements": "Afegir suport de valoracions",
                                  "redmineParentRef": "RM-100",
                                  "priority": 2,
                                  "dueDate": "2026-06-15",
                                  "jiraRef": "WB-101",
                                  "versionId": %d,
                                  "tagIds": [%d],
                                  "soldHours": 13.5,
                                  "status": "NOVA",
                                  "completionPercentage": 35,
                                  "note": {
                                    "context": "Context inicial",
                                    "riskDependency": "Cap risc",
                                    "observations": "Observacions inicials"
                                  }
                                }
                                """.formatted(versionId, tagId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Millora backend"))
                .andExpect(jsonPath("$.requirements").value("Afegir suport de valoracions"))
                .andExpect(jsonPath("$.version.id").value(versionId))
                .andExpect(jsonPath("$.tags[0].id").value(tagId))
                .andExpect(jsonPath("$.sold_hours").value(13.5))
                .andExpect(jsonPath("$.completion_percentage").value(35))
                .andExpect(jsonPath("$.note.context").value("Context inicial"))
                .andExpect(jsonPath("$.note.risk_dependency").value("Cap risc"))
                .andExpect(jsonPath("$.note.observations").value("Observacions inicials"));
    }

    @Test
    void createImprovement_rejectsCaseInsensitiveDuplicateJiraRef() throws Exception {
        mockMvc.perform(post("/api/v1/improvements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Primera millora",
                                  "jiraRef": "WB-102",
                                  "status": "NOVA",
                                  "completionPercentage": 0,
                                  "note": {}
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/v1/improvements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Duplicada",
                                  "jiraRef": "wb-102",
                                  "status": "NOVA",
                                  "completionPercentage": 0,
                                  "note": {}
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("conflict"))
                .andExpect(jsonPath("$.error.message").value("Improvement already exists for JIRA: wb-102"));
    }

    @Test
    void createValuation_requiresExistingImprovement() throws Exception {
        mockMvc.perform(post("/api/v1/improvements/999999/valuation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "redmineChildRef": "RM-VAL-1",
                                  "dueDate": "2026-06-30",
                                  "priority": 3
                                }
                                """))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.error.code").value("not_found"));
    }

    @Test
    void createValuation_rejectsSecondValuationForSameImprovement() throws Exception {
        String improvementLocation = createImprovement("Millora amb valoració", null);

        mockMvc.perform(post(improvementLocation + "/valuation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "redmineChildRef": "RM-VAL-2",
                                  "dueDate": "2026-07-01",
                                  "priority": 4
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(post(improvementLocation + "/valuation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "redmineChildRef": "RM-VAL-3",
                                  "dueDate": "2026-07-02",
                                  "priority": 1
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("conflict"));
    }

    @Test
    void createValuation_inheritsRequiredFieldsAndDefaults() throws Exception {
        Long versionId = createVersion("2027.01");
        Long tagId = createTag("ux", "#654321");
        String improvementLocation = createImprovement("Millora client", """
                  "versionId": %d,
                  "tagIds": [%d],
                  "priority": 2,
                  "status": "NOVA",
                  "completionPercentage": 10,
                  "note": {}
                """.formatted(versionId, tagId));

        mockMvc.perform(post(improvementLocation + "/valuation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "redmineChildRef": "RM-VAL-4",
                                  "dueDate": "2026-08-01",
                                  "priority": 5
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.derived_title").value("Valoració - Millora client"))
                .andExpect(jsonPath("$.version.id").value(versionId))
                .andExpect(jsonPath("$.tags[0].id").value(tagId))
                .andExpect(jsonPath("$.priority").value(5))
                .andExpect(jsonPath("$.status").value("NO_COMENCADA"))
                .andExpect(jsonPath("$.completion_percentage").value(0));
    }

    @Test
    void patchValuation_keepsVersionAndTagsNonEditable() throws Exception {
        Long initialVersionId = createVersion("2027.02");
        Long secondVersionId = createVersion("2027.03");
        Long initialTagId = createTag("api", "#111111");
        Long secondTagId = createTag("web", "#222222");

        String improvementLocation = createImprovement("Millora immutable", """
                  "versionId": %d,
                  "tagIds": [%d],
                  "priority": 2,
                  "status": "NOVA",
                  "completionPercentage": 0,
                  "note": {}
                """.formatted(initialVersionId, initialTagId));

        mockMvc.perform(post(improvementLocation + "/valuation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "redmineChildRef": "RM-VAL-5",
                                  "dueDate": "2026-09-01",
                                  "priority": 2
                                }
                                """))
                .andExpect(status().isCreated());

        mockMvc.perform(patch(improvementLocation + "/valuation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "priority": 6,
                                  "status": "EN_CURS",
                                  "completionPercentage": 55,
                                  "versionId": %d,
                                  "tagIds": [%d]
                                }
                                """.formatted(secondVersionId, secondTagId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.priority").value(6))
                .andExpect(jsonPath("$.status").value("EN_CURS"))
                .andExpect(jsonPath("$.completion_percentage").value(55))
                .andExpect(jsonPath("$.version.id").value(initialVersionId))
                .andExpect(jsonPath("$.tags[0].id").value(initialTagId));
    }

    @Test
    void getImprovementEntries_listsLinkedTaskEntries() throws Exception {
        String improvementLocation = createImprovement("Millora amb tasques", null);
        long improvementId = extractId(improvementLocation);

        mockMvc.perform(post("/api/v1/entries")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "type": "TASK",
                                  "title": "Tasca vinculada",
                                  "improvementId": %d
                                }
                                """.formatted(improvementId)))
                .andExpect(status().isCreated());

        mockMvc.perform(get(improvementLocation + "/entries"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.meta.total").value(1))
                .andExpect(jsonPath("$.data[0].title").value("Tasca vinculada"));
    }

    private String createImprovement(String title, String extraFieldsJson) throws Exception {
        String extraFields = extraFieldsJson == null
                ? """
                  "status": "NOVA",
                  "completionPercentage": 0,
                  "note": {}
                """
                : extraFieldsJson.trim();

        String payload = """
                {
                  "title": "%s",
                  "requirements": "Requisits bàsics",
                %s
                }
                """.formatted(title, extraFields);

        return mockMvc.perform(post("/api/v1/improvements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");
    }

    private Long createVersion(String name) throws Exception {
        String location = mockMvc.perform(post("/api/v1/versions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(java.util.Map.of("name", name))))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        return extractId(location);
    }

    private Long createTag(String name, String color) {
        TagEntity tag = new TagEntity();
        tag.setName(name);
        tag.setColor(color);
        return tagRepository.save(tag).getId();
    }

    private long extractId(String location) {
        return Long.parseLong(location.substring(location.lastIndexOf('/') + 1));
    }
}
