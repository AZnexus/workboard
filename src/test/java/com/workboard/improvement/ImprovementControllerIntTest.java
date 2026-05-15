package com.workboard.improvement;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.workboard.tag.TagEntity;
import com.workboard.tag.TagRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.annotation.DirtiesContext;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@DirtiesContext(classMode = DirtiesContext.ClassMode.AFTER_EACH_TEST_METHOD)
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:sqlite::memory:",
        "spring.jpa.hibernate.ddl-auto=none",
        "spring.flyway.enabled=true"
})
class ImprovementControllerIntTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private TagRepository tagRepository;

    @Test
    void listValuationTemplates_returnsSeededDefaultTemplate() throws Exception {
        mockMvc.perform(get("/api/v1/improvements/valuation-templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Plantilla base"))
                .andExpect(jsonPath("$[0].is_default").value(true))
                .andExpect(jsonPath("$[0].active").value(true))
                .andExpect(jsonPath("$[0].textile_template").value(org.hamcrest.Matchers.containsString("h1. Anàlisi")))
                .andExpect(jsonPath("$[0].textile_template").value(org.hamcrest.Matchers.containsString("{{analysis}}")))
                .andExpect(jsonPath("$[0].textile_template").value(org.hamcrest.Matchers.containsString("{{taskSummary}}")))
                .andExpect(jsonPath("$[0].textile_template").value(org.hamcrest.Matchers.containsString("{{preAnalysis}}")))
                .andExpect(jsonPath("$[0].textile_template").value(org.hamcrest.Matchers.containsString("{{db}}")))
                .andExpect(jsonPath("$[0].textile_template").value(org.hamcrest.Matchers.containsString("{{apis}}")))
                .andExpect(jsonPath("$[0].textile_template").value(org.hamcrest.Matchers.containsString("{{webs}}")))
                .andExpect(jsonPath("$[0].textile_template").value(org.hamcrest.Matchers.containsString("{{valuation}}")));
    }

    @Test
    void templateCrudAndDefaultSwitching_workThroughHttpEndpoints() throws Exception {
        String createdLocation = mockMvc.perform(post("/api/v1/improvements/valuation-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Plantilla alternativa",
                                  "textileTemplate": "h1. Alternativa",
                                  "isDefault": false,
                                  "active": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Plantilla alternativa"))
                .andExpect(jsonPath("$.is_default").value(false))
                .andReturn()
                .getResponse()
                .getHeader("Location");

        mockMvc.perform(patch(createdLocation)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Plantilla alternativa v2",
                                  "textileTemplate": "h1. Alternativa v2",
                                  "isDefault": true,
                                  "active": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Plantilla alternativa v2"))
                .andExpect(jsonPath("$.textile_template").value("h1. Alternativa v2"))
                .andExpect(jsonPath("$.is_default").value(true));

        mockMvc.perform(get("/api/v1/improvements/valuation-templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[?(@.name == 'Plantilla alternativa v2')].is_default").value(org.hamcrest.Matchers.contains(true)))
                .andExpect(jsonPath("$[?(@.name == 'Plantilla base')].is_default").value(org.hamcrest.Matchers.contains(false)));

        mockMvc.perform(delete(createdLocation))
                .andExpect(status().isNoContent());
    }

    @Test
    void deletingTemplateInUse_returnsConflict() throws Exception {
        String improvementLocation = createImprovement("Millora amb plantilla", null);

        String templateLocation = mockMvc.perform(post("/api/v1/improvements/valuation-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Plantilla protegida",
                                  "textileTemplate": "h1. Protegida",
                                  "isDefault": false,
                                  "active": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        long templateId = extractId(templateLocation);

        mockMvc.perform(patch(templateLocation)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "isDefault": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(templateId))
                .andExpect(jsonPath("$.is_default").value(true));

        mockMvc.perform(post(improvementLocation + "/valuation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "redmineChildRef": "RM-VAL-TPL-1",
                                  "dueDate": "2026-10-01",
                                  "priority": 3,
                                  "textileBody": "Textile manual",
                                  "structuredContentJson": "{}"
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.template.id").value(templateId));

        mockMvc.perform(get(improvementLocation + "/valuation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.template.id").value(templateId));

        mockMvc.perform(delete(templateLocation))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("conflict"))
                .andExpect(jsonPath("$.error.message").value("Cannot delete valuation template %d because it is still used by valuations".formatted(templateId)));
    }

    @Test
    void valuationResponses_includeTemplateMetadataAndCustomizedFlag() throws Exception {
        String improvementLocation = createImprovement("Millora metadata plantilla", null);

        String templateLocation = mockMvc.perform(post("/api/v1/improvements/valuation-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Plantilla metadata",
                                  "textileTemplate": "h1. Metadata",
                                  "isDefault": false,
                                  "active": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        long templateId = extractId(templateLocation);

        mockMvc.perform(patch(templateLocation)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "isDefault": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(templateId))
                .andExpect(jsonPath("$.is_default").value(true));

        mockMvc.perform(post(improvementLocation + "/valuation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "redmineChildRef": "RM-VAL-TPL-2",
                                  "dueDate": "2026-11-01",
                                  "priority": 4,
                                  "textileBody": "Textile personalitzat",
                                  "structuredContentJson": "{}",
                                  "analysisHours": 2.5,
                                  "totalEstimatedHours": 4.5
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.template.id").value(templateId))
                .andExpect(jsonPath("$.template.name").value("Plantilla metadata"))
                .andExpect(jsonPath("$.template.is_default").value(true))
                .andExpect(jsonPath("$.textile_customized").value(false));

        mockMvc.perform(get(improvementLocation + "/valuation"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.template.id").value(templateId))
                .andExpect(jsonPath("$.template.name").value("Plantilla metadata"))
                .andExpect(jsonPath("$.textile_customized").value(false));
    }

    @Test
    void patchValuationTemplate_rejectsDeactivatingTheCurrentDefaultTemplate() throws Exception {
        mockMvc.perform(get("/api/v1/improvements/valuation-templates"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].name").value("Plantilla base"))
                .andExpect(jsonPath("$[0].is_default").value(true))
                .andExpect(jsonPath("$[0].active").value(true));

        mockMvc.perform(patch("/api/v1/improvements/valuation-templates/1")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "active": false
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("conflict"))
                .andExpect(jsonPath("$.error.message").value("Default valuation template cannot be inactive"));
    }

    @Test
    void deleteValuationTemplate_rejectsInactiveFallbackWhenDeletingCurrentDefault() throws Exception {
        String fallbackLocation = mockMvc.perform(post("/api/v1/improvements/valuation-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Fallback inactiva",
                                  "textileTemplate": "h1. Fallback",
                                  "isDefault": false,
                                  "active": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        mockMvc.perform(patch(fallbackLocation)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "active": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.active").value(false));

        mockMvc.perform(delete("/api/v1/improvements/valuation-templates/1"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("conflict"))
                .andExpect(jsonPath("$.error.message").value("Cannot delete default valuation template because no active fallback exists"));
    }

    @Test
    void createValuationTemplate_rejectsInactiveDefaultTemplate() throws Exception {
        mockMvc.perform(post("/api/v1/improvements/valuation-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Default inactiva",
                                  "textileTemplate": "h1. Inactiva",
                                  "isDefault": true,
                                  "active": false
                                }
                                """))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("conflict"))
                .andExpect(jsonPath("$.error.message").value("Default valuation template cannot be inactive"));
    }

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
    void createValuation_usesRequestedTemplateIdWhenProvided() throws Exception {
        String improvementLocation = createImprovement("Millora amb plantilla seleccionada", null);

        String templateLocation = mockMvc.perform(post("/api/v1/improvements/valuation-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Plantilla selector",
                                  "textileTemplate": "h1. Selector",
                                  "isDefault": false,
                                  "active": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        long templateId = extractId(templateLocation);

        mockMvc.perform(post(improvementLocation + "/valuation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "redmineChildRef": "RM-VAL-TPL-SELECTED",
                                  "dueDate": "2026-10-01",
                                  "priority": 3,
                                  "templateId": %d
                                }
                                """.formatted(templateId)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.template.id").value(templateId))
                .andExpect(jsonPath("$.template.name").value("Plantilla selector"));
    }

    @Test
    void createValuation_withoutTemplateId_usesCurrentDefaultTemplate() throws Exception {
        String improvementLocation = createImprovement("Millora amb default actiu", null);

        String templateLocation = mockMvc.perform(post("/api/v1/improvements/valuation-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Plantilla default actual",
                                  "textileTemplate": "h1. Default actual",
                                  "isDefault": false,
                                  "active": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        long templateId = extractId(templateLocation);

        mockMvc.perform(patch(templateLocation)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "isDefault": true
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(templateId))
                .andExpect(jsonPath("$.is_default").value(true));

        mockMvc.perform(post(improvementLocation + "/valuation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "redmineChildRef": "RM-VAL-TPL-DEFAULT",
                                  "dueDate": "2026-10-02",
                                  "priority": 4
                                }
                                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.template.id").value(templateId))
                .andExpect(jsonPath("$.template.is_default").value(true));
    }

    @Test
    void createValuation_withInactiveTemplate_returnsConflict() throws Exception {
        String improvementLocation = createImprovement("Millora amb plantilla inactiva", null);

        String templateLocation = mockMvc.perform(post("/api/v1/improvements/valuation-templates")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Plantilla inactiva",
                                  "textileTemplate": "h1. Inactiva",
                                  "isDefault": false,
                                  "active": true
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getHeader("Location");

        long templateId = extractId(templateLocation);

        mockMvc.perform(patch(templateLocation)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "active": false
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(templateId))
                .andExpect(jsonPath("$.active").value(false));

        mockMvc.perform(post(improvementLocation + "/valuation")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "redmineChildRef": "RM-VAL-TPL-INACTIVE",
                                  "dueDate": "2026-10-03",
                                  "priority": 4,
                                  "templateId": %d
                                }
                                """.formatted(templateId)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.error.code").value("conflict"))
                .andExpect(jsonPath("$.error.message").value("Valuation template %d is inactive".formatted(templateId)));
    }

    @Test
    void patchValuation_updatesEditableFieldsOnly() throws Exception {
        Long initialVersionId = createVersion("2027.02");
        Long initialTagId = createTag("api", "#111111");

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
                                  "completionPercentage": 55
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.priority").value(6))
                .andExpect(jsonPath("$.status").value("EN_CURS"))
                .andExpect(jsonPath("$.completion_percentage").value(55))
                .andExpect(jsonPath("$.redmine_child_ref").value("RM-VAL-5"))
                .andExpect(jsonPath("$.due_date").value("2026-09-01"))
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
