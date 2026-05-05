package com.workboard.entry;

import org.junit.jupiter.api.Test;
import org.springframework.data.domain.Sort;

import java.lang.reflect.Method;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class EntrySortsTest {

    @Test
    void defaultSort_ordersPinnedThenCreatedAtDescending() throws Exception {
        Class<?> entrySortsClass = Class.forName("com.workboard.entry.EntrySorts");
        Method defaultSort = entrySortsClass.getMethod("defaultSort");

        Sort sort = (Sort) defaultSort.invoke(null);
        List<Sort.Order> orders = sort.toList();

        assertThat(orders)
                .extracting(Sort.Order::getProperty, Sort.Order::getDirection)
                .containsExactly(
                        org.assertj.core.groups.Tuple.tuple("pinned", Sort.Direction.DESC),
                        org.assertj.core.groups.Tuple.tuple("createdAt", Sort.Direction.DESC)
                );
    }
}
