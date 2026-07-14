package com.rainbowforest.productcatalogservice.service;

import com.rainbowforest.productcatalogservice.entity.Product;
import com.rainbowforest.productcatalogservice.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.cache.annotation.CacheEvict;
import java.util.List;
@Service
@Transactional
public class ProductServiceImpl implements ProductService {

    @Autowired
    private ProductRepository productRepository;

    @Override
    @Cacheable(value = "products", key = "'all'")
    public List<Product> getAllProduct() {
        return productRepository.findAll();
    }

    @Override
    @Cacheable(value = "products", key = "'category_' + #category")
    public List<Product> getAllProductByCategory(String category) {
        return productRepository.findAllByCategory(category);
    }

    @Override
    @Cacheable(value = "product", key = "#id")
    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @Override
    @Cacheable(value = "products", key = "'name_' + #name")
    public List<Product> getAllProductsByName(String name) {
        return productRepository.findAllByProductName(name);
    }

    @Override
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public Product addProduct(Product product) {
        product.setAdminManaged(true);
        return productRepository.save(product);
    }

    @Override
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public Product updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            product.setProductName(productDetails.getProductName());
            product.setPrice(productDetails.getPrice());
            product.setOriginalPrice(productDetails.getOriginalPrice());
            product.setDiscription(productDetails.getDiscription());
            product.setCategory(productDetails.getCategory());
            product.setAvailability(productDetails.getAvailability());
            product.setImageUrl(productDetails.getImageUrl());
            return productRepository.save(product);
        }
        return null;
    }

    @Override
    @CacheEvict(value = {"products", "product"}, allEntries = true)
    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    @Override
    @Cacheable(value = "products", key = "'adminManaged'")
    public List<Product> getAdminManagedProducts() {
        return productRepository.findAllByAdminManagedTrue();
    }
}
