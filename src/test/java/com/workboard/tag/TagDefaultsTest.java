package com.workboard.tag;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class TagDefaultsTest {

    @Test
    void createTagRequest_usesTagDefaultColorWhenColorIsNull() {
        CreateTagRequest request = new CreateTagRequest("urgent", null);

        assertEquals("#6B7280", request.color());
    }
}
