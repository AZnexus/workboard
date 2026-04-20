package com.workboard.tag;

public class TagNotFoundException extends RuntimeException {

    public TagNotFoundException(Long id) {
        super("Tag not found: " + id);
    }
}
