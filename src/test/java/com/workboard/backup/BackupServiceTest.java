package com.workboard.backup;

import org.junit.jupiter.api.Test;

import java.lang.reflect.Field;
import java.lang.reflect.Method;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertTrue;

class BackupServiceTest {

    @Test
    void pruneOldBackups_skipsDeletionWhenRetentionIsZero() throws Exception {
        BackupService service = new BackupService();
        setField(service, "retention", 0);
        setField(service, "backupFilenamePrefix", "workboard-");

        Path backupDir = Files.createTempDirectory("backup-service-test");
        Files.createFile(backupDir.resolve("workboard-2026-05-01.db"));
        Files.createFile(backupDir.resolve("workboard-2026-05-02.db"));

        Method pruneMethod = BackupService.class.getDeclaredMethod("pruneOldBackups", Path.class);
        pruneMethod.setAccessible(true);

        assertDoesNotThrow(() -> pruneMethod.invoke(service, backupDir));
        assertTrue(Files.exists(backupDir.resolve("workboard-2026-05-01.db")));
        assertTrue(Files.exists(backupDir.resolve("workboard-2026-05-02.db")));
    }

    private static void setField(Object target, String fieldName, Object value) throws Exception {
        Field field = target.getClass().getDeclaredField(fieldName);
        field.setAccessible(true);
        field.set(target, value);
    }
}
