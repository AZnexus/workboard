package com.workboard.project;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProjectServiceTest {

    @Mock
    private ProjectRepository projectRepository;

    @InjectMocks
    private ProjectService projectService;

    @Test
    void create_rejectsCaseInsensitiveDuplicateName() {
        ProjectEntity existing = new ProjectEntity();
        existing.setId(1L);
        existing.setName("API");

        when(projectRepository.findByNameIgnoreCase("api")).thenReturn(Optional.of(existing));

        CreateProjectRequest request = new CreateProjectRequest("api", null, "#3B82F6");

        assertThatThrownBy(() -> projectService.create(request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Project already exists");

        verify(projectRepository, never()).save(any(ProjectEntity.class));
    }

    @Test
    void create_preservesOriginalCasingWhenSaving() {
        when(projectRepository.findByNameIgnoreCase("aPi Client")).thenReturn(Optional.empty());
        when(projectRepository.save(any(ProjectEntity.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CreateProjectRequest request = new CreateProjectRequest("aPi Client", null, "#3B82F6");

        ProjectEntity created = projectService.create(request);

        assertThat(created.getName()).isEqualTo("aPi Client");
        verify(projectRepository).findByNameIgnoreCase("aPi Client");
    }

    @Test
    void update_rejectsCaseInsensitiveDuplicateNameOwnedByAnotherProject() {
        ProjectEntity current = new ProjectEntity();
        current.setId(7L);
        current.setName("Mobile");

        ProjectEntity existing = new ProjectEntity();
        existing.setId(8L);
        existing.setName("API");

        when(projectRepository.findById(7L)).thenReturn(Optional.of(current));
        when(projectRepository.findByNameIgnoreCase("api")).thenReturn(Optional.of(existing));

        UpdateProjectRequest request = new UpdateProjectRequest("api", null, null, null);

        assertThatThrownBy(() -> projectService.update(7L, request))
                .isInstanceOf(IllegalArgumentException.class)
                .hasMessageContaining("Project already exists");

        verify(projectRepository, never()).save(any(ProjectEntity.class));
    }

    @Test
    void update_allowsSameProjectNameWithDifferentCasing() {
        ProjectEntity current = new ProjectEntity();
        current.setId(7L);
        current.setName("API");

        when(projectRepository.findById(7L)).thenReturn(Optional.of(current));
        when(projectRepository.findByNameIgnoreCase("api")).thenReturn(Optional.of(current));
        when(projectRepository.save(current)).thenReturn(current);

        UpdateProjectRequest request = new UpdateProjectRequest("api", null, null, null);

        ProjectEntity updated = projectService.update(7L, request);

        assertThat(updated.getName()).isEqualTo("api");
        verify(projectRepository).findByNameIgnoreCase(eq("api"));
        verify(projectRepository).save(current);
    }
}
