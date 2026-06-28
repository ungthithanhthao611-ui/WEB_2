package com.rainbowforest.productcatalogservice.controller;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.http.header.HeaderGenerator;
import com.rainbowforest.productcatalogservice.service.ProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;

import java.util.List;
import com.rainbowforest.productcatalogservice.entity.ProductVariant;
import com.rainbowforest.productcatalogservice.repository.ProductVariantRepository;
import org.springframework.transaction.annotation.Transactional;

@RestController
@RequestMapping("/admin")
public class AdminProductController {

    @Autowired
    private ProductService productService;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @Autowired private ProductVariantRepository variantRepository;

    @GetMapping(value = "/products")
    public ResponseEntity<List<Product>> getAdminProducts() {
        List<Product> products = productService.getAllProduct();
        return new ResponseEntity<>(
                products,
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }

    @PostMapping(value = "/products")
    public ResponseEntity<Product> addProduct(@RequestBody Product product, HttpServletRequest request){
    	if(product != null) {
    		try {
    			productService.addProduct(product);
    	        return new ResponseEntity<Product>(
    	        		product,
    	        		headerGenerator.getHeadersForSuccessPostMethod(request, product.getId()),
    	        		HttpStatus.CREATED);
    		}catch (Exception e) {
				e.printStackTrace();
				return new ResponseEntity<Product>(
						headerGenerator.getHeadersForError(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
    	}
    	return new ResponseEntity<Product>(
    			headerGenerator.getHeadersForError(),
    			HttpStatus.BAD_REQUEST);       
    }
    
    @PutMapping(value = "/products/{id}")
    public ResponseEntity<Product> updateProduct(@PathVariable("id") Long id, @RequestBody Product product, HttpServletRequest request) {
    	if(product != null) {
    		try {
    			Product updatedProduct = productService.updateProduct(id, product);
    			if (updatedProduct != null) {
    				return new ResponseEntity<Product>(
    						updatedProduct,
    						headerGenerator.getHeadersForSuccessGetMethod(),
    						HttpStatus.OK);
    			}
    			return new ResponseEntity<Product>(
    					headerGenerator.getHeadersForError(),
    					HttpStatus.NOT_FOUND);
    		} catch (Exception e) {
				e.printStackTrace();
				return new ResponseEntity<Product>(
						headerGenerator.getHeadersForError(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
    	}
    	return new ResponseEntity<Product>(
    			headerGenerator.getHeadersForError(),
    			HttpStatus.BAD_REQUEST);       
    }

    @DeleteMapping(value = "/products/{id}")
    public ResponseEntity<Void> deleteProduct(@PathVariable("id") Long id){
    	Product product = productService.getProductById(id);
    	if(product != null) {
    		try {
    			productService.deleteProduct(id);
    	        return new ResponseEntity<Void>(
    	        		headerGenerator.getHeadersForSuccessGetMethod(),
    	        		HttpStatus.OK);
    		}catch (Exception e) {
				e.printStackTrace();
     	        return new ResponseEntity<Void>(
    	        		headerGenerator.getHeadersForError(),
    	        		HttpStatus.INTERNAL_SERVER_ERROR);
			}
    	}
    	return new ResponseEntity<Void>(headerGenerator.getHeadersForError(), HttpStatus.NOT_FOUND);      
    }

    @GetMapping("/products/{id}/variants")
    public List<ProductVariant> variants(@PathVariable Long id){return variantRepository.findByProductIdOrderByPriceAsc(id);}

    @PutMapping("/products/{id}/variants")
    @Transactional
    public List<ProductVariant> saveVariants(@PathVariable Long id,@RequestBody List<ProductVariant> variants){
        Product product=productService.getProductById(id);
        if(product==null)throw new IllegalArgumentException("Không tìm thấy sản phẩm");
        variantRepository.deleteAll(variantRepository.findByProductIdOrderByPriceAsc(id));
        variantRepository.flush();
        variants.forEach(v->{v.setId(null);v.setProduct(product);if(v.getSku()==null||v.getSku().isBlank())v.setSku("P"+id+"-"+v.getName().toUpperCase());});
        return variantRepository.saveAll(variants);
    }
}
