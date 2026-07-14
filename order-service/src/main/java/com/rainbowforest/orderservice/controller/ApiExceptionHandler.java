package com.rainbowforest.orderservice.controller;

import org.springframework.http.*;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;
import feign.FeignException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> validation(MethodArgumentNotValidException exception) {
        Map<String, String> fields = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(error -> fields.putIfAbsent(error.getField(), error.getDefaultMessage()));
        return ResponseEntity.badRequest().body(Map.of("code", "VALIDATION_ERROR", "message", "Dữ liệu không hợp lệ", "fields", fields));
    }

    @ExceptionHandler({IllegalArgumentException.class, NoSuchElementException.class})
    public ResponseEntity<Map<String, Object>> business(RuntimeException exception) {
        HttpStatus status = exception instanceof NoSuchElementException ? HttpStatus.NOT_FOUND : HttpStatus.BAD_REQUEST;
        return ResponseEntity.status(status).body(Map.of("code", "BUSINESS_ERROR", "message", exception.getMessage()));
    }

    @ExceptionHandler(FeignException.class)
    public ResponseEntity<Map<String, Object>> downstream(FeignException exception) {
        String message = exception.status() == 404
                ? "Tài khoản hoặc sản phẩm không còn tồn tại, vui lòng đăng nhập lại và làm mới giỏ hàng"
                : "Không thể kiểm tra tài khoản hoặc tồn kho sản phẩm";
        String body = exception.contentUTF8();
        if (body != null && body.contains("\"message\"")) {
            int start = body.indexOf("\"message\"") + 9;
            start = body.indexOf('"', start) + 1;
            int end = body.indexOf('"', start);
            if (start > 0 && end > start) message = body.substring(start, end);
        }
        return ResponseEntity.badRequest().body(Map.of("code", "DOWNSTREAM_ERROR", "message", message));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, Object>> unreadable(HttpMessageNotReadableException exception) {
        String detail = exception.getMostSpecificCause() == null ? exception.getMessage() : exception.getMostSpecificCause().getMessage();
        return ResponseEntity.badRequest().body(Map.of("code", "INVALID_JSON", "message", "Dữ liệu checkout không đúng định dạng", "detail", detail == null ? "" : detail));
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<Map<String, Object>> uploadTooLarge(MaxUploadSizeExceededException exception) {
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(Map.of(
            "code", "FILE_TOO_LARGE",
            "message", "Ảnh tối đa 5MB"
        ));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, String>> handleException(Exception e) {
        try {
            java.io.PrintWriter pw = new java.io.PrintWriter(new java.io.FileWriter("d:/Web2_/e-commerce-microservices/debug-500.txt", true));
            e.printStackTrace(pw);
            pw.close();
        } catch(Exception ignored) {}
        Map<String, String> response = new HashMap<>();
        response.put("error", e.getMessage());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
