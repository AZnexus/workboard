package com.workboard.improvement;

public class ValuationAlreadyExistsException extends IllegalArgumentException {

    public ValuationAlreadyExistsException(Long improvementId) {
        super("Valuation already exists for improvement: " + improvementId);
    }
}
