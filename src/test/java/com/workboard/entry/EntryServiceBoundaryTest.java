package com.workboard.entry;

import com.workboard.tag.TagService;
import org.junit.jupiter.api.Test;

import java.lang.reflect.Constructor;
import java.util.Arrays;

import static org.assertj.core.api.Assertions.assertThat;

class EntryServiceBoundaryTest {

    @Test
    void constructor_dependsOnTagServiceInsteadOfTagRepository() {
        Constructor<?>[] constructors = EntryService.class.getConstructors();

        assertThat(constructors).singleElement().satisfies(constructor -> {
            Class<?>[] parameterTypes = constructor.getParameterTypes();
            assertThat(Arrays.asList(parameterTypes))
                    .contains(TagService.class)
                    .doesNotContain(com.workboard.tag.TagRepository.class);
        });
    }
}
