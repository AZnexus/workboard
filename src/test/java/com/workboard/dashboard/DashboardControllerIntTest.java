package com.workboard.dashboard;

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
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.datasource.url=jdbc:sqlite::memory:",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.flyway.enabled=false"
})
class DashboardControllerIntTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private EntryRepository entryRepository;

    @Autowired
    private TagRepository tagRepository;

    @Test
    void daily_serializesTagsAcrossDashboardBuckets() throws Exception {
        LocalDate date = LocalDate.of(2026, 4, 24);
        LocalDate previousWorkday = previousWorkday(date);
        String suffix = UUID.randomUUID().toString();

        String pinnedTitle = "Pinned note " + suffix;
        String scheduledTitle = "Scheduled task " + suffix;
        String backlogTitle = "Backlog task " + suffix;
        String yesterdayTitle = "Yesterday done " + suffix;
        String reminderTitle = "Reminder " + suffix;

        String pinnedTag = "tag-pinned-" + suffix;
        String scheduledTag = "tag-scheduled-" + suffix;
        String backlogTag = "tag-backlog-" + suffix;
        String yesterdayTag = "tag-yesterday-" + suffix;
        String reminderTag = "tag-reminder-" + suffix;

        saveTaggedEntry(EntryType.NOTE, pinnedTitle, EntryStatus.OPEN, date, true, false, pinnedTag, "#123456");
        saveTaggedEntry(EntryType.TASK, scheduledTitle, EntryStatus.OPEN, date.minusDays(1), false, true, scheduledTag, "#2563EB");
        saveTaggedEntry(EntryType.TASK, backlogTitle, EntryStatus.IN_PROGRESS, date.minusDays(2), false, false, backlogTag, "#16A34A");
        saveTaggedEntry(EntryType.TASK, yesterdayTitle, EntryStatus.DONE, previousWorkday, false, false, yesterdayTag, "#7C3AED");
        saveTaggedEntry(EntryType.REMINDER, reminderTitle, EntryStatus.OPEN, date.minusDays(3), false, false, reminderTag, "#DC2626");

        mockMvc.perform(get("/api/v1/dashboard/daily").param("date", date.toString()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.entries[?(@.title == '%s')].tags[0].name".formatted(pinnedTitle)).value(org.hamcrest.Matchers.contains(pinnedTag)))
                .andExpect(jsonPath("$.entries[?(@.title == '%s')].tags[0].color".formatted(pinnedTitle)).value(org.hamcrest.Matchers.contains("#123456")))
                .andExpect(jsonPath("$.entries[?(@.title == '%s')].tags[0].name".formatted(scheduledTitle)).value(org.hamcrest.Matchers.contains(scheduledTag)))
                .andExpect(jsonPath("$.entries[?(@.title == '%s')].tags[0].color".formatted(scheduledTitle)).value(org.hamcrest.Matchers.contains("#2563EB")))
                .andExpect(jsonPath("$.pinned[?(@.title == '%s')].tags[0].name".formatted(pinnedTitle)).value(org.hamcrest.Matchers.contains(pinnedTag)))
                .andExpect(jsonPath("$.yesterday_done[?(@.title == '%s')].tags[0].name".formatted(yesterdayTitle)).value(org.hamcrest.Matchers.contains(yesterdayTag)))
                .andExpect(jsonPath("$.backlog[?(@.title == '%s')].tags[0].name".formatted(backlogTitle)).value(org.hamcrest.Matchers.contains(backlogTag)))
                .andExpect(jsonPath("$.reminders[?(@.title == '%s')].tags[0].name".formatted(reminderTitle)).value(org.hamcrest.Matchers.contains(reminderTag)));
    }

    @Test
    void standup_serializesTagsForYesterdayDoneAndTodayPlan() throws Exception {
        LocalDate today = LocalDate.now();
        LocalDate yesterday = previousWorkday(today);
        String suffix = UUID.randomUUID().toString();

        String yesterdayTitle = "Standup done " + suffix;
        String todayPlanTitle = "Standup planned " + suffix;
        String yesterdayTag = "tag-standup-done-" + suffix;
        String todayTag = "tag-standup-plan-" + suffix;

        saveTaggedEntry(EntryType.TASK, yesterdayTitle, EntryStatus.DONE, yesterday, false, false, yesterdayTag, "#0EA5E9");
        saveTaggedEntry(EntryType.TASK, todayPlanTitle, EntryStatus.OPEN, today.minusDays(1), false, true, todayTag, "#F59E0B");

        mockMvc.perform(get("/api/v1/dashboard/standup"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.yesterday_done[?(@.title == '%s')].tags[0].name".formatted(yesterdayTitle)).value(org.hamcrest.Matchers.contains(yesterdayTag)))
                .andExpect(jsonPath("$.yesterday_done[?(@.title == '%s')].tags[0].color".formatted(yesterdayTitle)).value(org.hamcrest.Matchers.contains("#0EA5E9")))
                .andExpect(jsonPath("$.today_plan[?(@.title == '%s')].tags[0].name".formatted(todayPlanTitle)).value(org.hamcrest.Matchers.contains(todayTag)))
                .andExpect(jsonPath("$.today_plan[?(@.title == '%s')].tags[0].color".formatted(todayPlanTitle)).value(org.hamcrest.Matchers.contains("#F59E0B")));
    }

    private void saveTaggedEntry(
            EntryType type,
            String title,
            EntryStatus status,
            LocalDate date,
            boolean pinned,
            boolean scheduledToday,
            String tagName,
            String color
    ) {
        TagEntity tag = new TagEntity();
        tag.setName(tagName);
        tag.setColor(color);
        TagEntity savedTag = tagRepository.save(tag);

        EntryEntity entry = new EntryEntity();
        entry.setType(type);
        entry.setTitle(title);
        entry.setStatus(status);
        entry.setDate(date);
        entry.setPinned(pinned);
        entry.setScheduledToday(scheduledToday);
        entry.addTag(savedTag);

        entryRepository.save(entry);
    }

    private LocalDate previousWorkday(LocalDate date) {
        LocalDate previous = date.minusDays(1);
        while (previous.getDayOfWeek() == DayOfWeek.SATURDAY || previous.getDayOfWeek() == DayOfWeek.SUNDAY) {
            previous = previous.minusDays(1);
        }
        return previous;
    }
}
