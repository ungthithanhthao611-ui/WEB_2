package com.rainbowforest.productcatalogservice.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import java.util.Map;

@RestControllerAdvice
public class CatalogExceptionHandler {
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBusinessError(IllegalArgumentException exception) {
        return ResponseEntity.badRequest().body(Map.of(
                "code", "INVENTORY_ERROR",
                "message", exception.getMessage()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleGenericException(Exception exception) {
        try {
            java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter("d:/Web2_/e-commerce-microservices/debug-catalog-500.txt", true));
            exception.printStackTrace(pw);
            pw.close();
        } catch(Exception ignored) {}
        return ResponseEntity.status(500).body(Map.of("error", exception.getMessage() != null ? exception.getMessage() : exception.getClass().getName()));
    }
}
