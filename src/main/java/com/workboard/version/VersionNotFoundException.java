package com.workboard.version;

public class VersionNotFoundException extends RuntimeException {

    public VersionNotFoundException(Long id) {
        super("Version not found: " + id);
    }
}
