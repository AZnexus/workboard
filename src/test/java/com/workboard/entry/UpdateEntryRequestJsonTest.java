package com.workboard.entry;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;

import static org.assertj.core.api.Assertions.assertThat;

class UpdateEntryRequestJsonTest {

    private final ObjectMapper objectMapper = new ObjectMapper().findAndRegisterModules();

    @Test
    void jsonBinding_marksFieldsAsProvidedWhenPresentEvenIfNull() throws Exception {
        UpdateEntryRequest request = objectMapper.readValue(
                """
                {"dueDate":null,"scheduledToday":false,"versionId":null}
                """,
                UpdateEntryRequest.class
        );

        assertThat(request.dueDateProvided()).isTrue();
        assertThat(request.dueDate()).isNull();
        assertThat(request.scheduledTodayProvided()).isTrue();
        assertThat(request.scheduledToday()).isFalse();
        assertThat(request.versionIdProvided()).isTrue();
        assertThat(request.versionId()).isNull();
    }

    @Test
    void jsonBinding_leavesProvidedFlagsFalseWhenFieldsAreAbsent() throws Exception {
        UpdateEntryRequest request = objectMapper.readValue(
                """
                {"title":"Only title"}
                """,
                UpdateEntryRequest.class
        );

        assertThat(request.title()).isEqualTo("Only title");
        assertThat(request.dueDateProvided()).isFalse();
        assertThat(request.scheduledTodayProvided()).isFalse();
        assertThat(request.versionIdProvided()).isFalse();
    }

    @Test
    void constructor_preservesExplicitProvidedFlagsForServiceTests() {
        UpdateEntryRequest request = new UpdateEntryRequest(
                null,
                null,
                null,
                null,
                null,
                LocalDate.of(2026, 5, 5),
                true,
                null,
                null,
                null,
                null,
                99L,
                true,
                true,
                true
        );

        assertThat(request.dueDate()).isEqualTo(LocalDate.of(2026, 5, 5));
        assertThat(request.dueDateProvided()).isTrue();
        assertThat(request.scheduledToday()).isTrue();
        assertThat(request.scheduledTodayProvided()).isTrue();
        assertThat(request.versionId()).isEqualTo(99L);
        assertThat(request.versionIdProvided()).isTrue();
    }
}
