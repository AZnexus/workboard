package com.workboard.entry;

public class EntryNotFoundException extends RuntimeException {

    public EntryNotFoundException(Long id) {
        super("Entry not found: " + id);
    }
}
