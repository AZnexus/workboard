package com.workboard.project;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class ProjectDefaultsTest {

    @Test
    void createProjectRequest_usesProjectDefaultColorWhenColorIsNull() {
        CreateProjectRequest request = new CreateProjectRequest("API", null, null);

        assertEquals("#3B82F6", request.color());
    }
}
