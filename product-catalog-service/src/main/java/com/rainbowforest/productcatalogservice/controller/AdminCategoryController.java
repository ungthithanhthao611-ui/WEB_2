package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Category;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/admin")
public class AdminCategoryController {

    @Autowired
    private CategoryService categoryService;

    @Autowired
    private HeaderGenerator headerGenerator;

    @PostMapping("/categories")
    public ResponseEntity<Category> addCategory(@RequestBody Category category, HttpServletRequest request) {
        if (category != null) {
            try {
                categoryService.addCategory(category);
                return new ResponseEntity<>(
                        category,
                        headerGenerator.getHeadersForSuccessPostMethod(request, category.getId()),
                        HttpStatus.CREATED
                );
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
        return new ResponseEntity<>(
                headerGenerator.getHeadersForError(),
                HttpStatus.BAD_REQUEST
        );
    }

    @PutMapping("/categories/{id}")
    public ResponseEntity<Category> updateCategory(@PathVariable("id") Long id, @RequestBody Category category, HttpServletRequest request) {
        if (category != null) {
            try {
                Category updatedCategory = categoryService.updateCategory(id, category);
                if (updatedCategory != null) {
                    return new ResponseEntity<>(
                            updatedCategory,
                            headerGenerator.getHeadersForSuccessGetMethod(),
                            HttpStatus.OK
                    );
                }
                return new ResponseEntity<>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.NOT_FOUND
                    );
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.INTERNAL_SERVER_ERROR
                );
            }
        }
        return new ResponseEntity<>(
                headerGenerator.getHeadersForError(),
                HttpStatus.BAD_REQUEST
        );
    }

    @DeleteMapping("/categories/{id}")
    public ResponseEntity<Void> deleteCategory(@PathVariable("id") Long id) {
        Category category = categoryService.getCategoryById(id);
        if (category != null) {
            try {
                categoryService.deleteCategory(id);
                return new ResponseEntity<>(
                        headerGenerator.getHeadersForSuccessGetMethod(),
                        HttpStatus.OK
                    );
            } catch (Exception e) {
                e.printStackTrace();
                return new ResponseEntity<>(
                        headerGenerator.getHeadersForError(),
                        HttpStatus.INTERNAL_SERVER_ERROR
                    );
            }
        }
        return new ResponseEntity<>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);
    }
}
