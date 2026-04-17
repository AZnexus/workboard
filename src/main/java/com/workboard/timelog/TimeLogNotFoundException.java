package com.workboard.timelog;

public class TimeLogNotFoundException extends RuntimeException {

    public TimeLogNotFoundException(Long id) {
        super("TimeLog not found: " + id);
    }
}
