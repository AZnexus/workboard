package com.workboard.improvement;

public class ValuationTemplateNotFoundException extends RuntimeException {

    public ValuationTemplateNotFoundException(Long id) {
        super("Valuation template not found: " + id);
    }
}
