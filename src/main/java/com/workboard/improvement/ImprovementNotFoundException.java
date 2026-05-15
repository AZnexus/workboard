package com.workboard.improvement;

public class ImprovementNotFoundException extends RuntimeException {

    public ImprovementNotFoundException(Long id) {
        super("Improvement not found: " + id);
    }
}
