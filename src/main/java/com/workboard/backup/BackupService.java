package com.workboard.backup;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Stream;

@Service
public class BackupService {

    private static final Logger log = LoggerFactory.getLogger(BackupService.class);

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${workboard.backup.dir:./backups}")
    private String backupDir;

    @Value("${workboard.backup.retention:30}")
    private int retention;

    @Scheduled(cron = "0 0 2 * * *")
    public void backup() {
        try {
            String dbPath = datasourceUrl.replace("jdbc:sqlite:", "");
            Path source = Paths.get(dbPath);

            if (!Files.exists(source)) {
                log.warn("backup_skipped db_not_found path={}", source);
                return;
            }

            Path backupDirectory = Paths.get(backupDir);
            Files.createDirectories(backupDirectory);

            String fileName = "workboard-" + LocalDate.now() + ".db";
            Path target = backupDirectory.resolve(fileName);
            Files.copy(source, target, StandardCopyOption.REPLACE_EXISTING);
            log.info("backup_created target={}", target);

            pruneOldBackups(backupDirectory);
        } catch (IOException e) {
            log.error("backup_failed", e);
        }
    }

    private void pruneOldBackups(Path backupDirectory) throws IOException {
        try (Stream<Path> stream = Files.list(backupDirectory)) {
            List<Path> backups = stream
                    .filter(p -> p.getFileName().toString().startsWith("workboard-") && p.getFileName().toString().endsWith(".db"))
                    .sorted(Comparator.comparing(p -> p.getFileName().toString()))
                    .toList();

            if (backups.size() > retention) {
                List<Path> toDelete = backups.subList(0, backups.size() - retention);
                for (Path old : toDelete) {
                    Files.deleteIfExists(old);
                    log.info("backup_pruned file={}", old.getFileName());
                }
            }
        }
    }
}
