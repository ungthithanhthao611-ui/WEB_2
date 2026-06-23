package com.rainbowforest.recommendationservice.controller;

import com.rainbowforest.recommendationservice.feignClient.ProductClient;
import com.rainbowforest.recommendationservice.feignClient.UserClient;
import com.rainbowforest.recommendationservice.http.header.HeaderGenerator;
import com.rainbowforest.recommendationservice.model.Product;
import com.rainbowforest.recommendationservice.model.Recommendation;
import com.rainbowforest.recommendationservice.model.User;
import com.rainbowforest.recommendationservice.service.RecommendationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpServletRequest;
import java.util.ArrayList;
import java.util.List;

@RestController
public class RecommendationController {

    @Autowired
    private RecommendationService recommendationService;

    @Autowired
    private com.rainbowforest.recommendationservice.repository.ProductRepository productRepository;

    @Autowired
    private com.rainbowforest.recommendationservice.repository.UserRepository userRepository;
    
    @Autowired
    private HeaderGenerator headerGenerator;

    @GetMapping(value = "/recommendations")
    public ResponseEntity<List<Recommendation>> getAllRating(@RequestParam("name") String productName){
        List<Recommendation> recommendations = recommendationService.getAllRecommendationByProductName(productName);
        return new ResponseEntity<List<Recommendation>>(
        		recommendations != null ? recommendations : new ArrayList<>(),
        		headerGenerator.getHeadersForSuccessGetMethod(),
        		HttpStatus.OK);
    }

    @GetMapping(value = "/{userId}/recommendations")
    public ResponseEntity<List<Recommendation>> getRecommendationsByUserId(@PathVariable("userId") Long userId){
        List<Recommendation> recommendations = recommendationService.getAllRecommendationByUserId(userId);
        return new ResponseEntity<List<Recommendation>>(
                recommendations != null ? recommendations : new ArrayList<>(),
                headerGenerator.getHeadersForSuccessGetMethod(),
                HttpStatus.OK);
    }
    
    @PostMapping(value = "/{userId}/recommendations/{productId}")
    public ResponseEntity<Recommendation> saveRecommendations(
            @PathVariable ("userId") Long userId,
            @PathVariable ("productId") Long productId,
            @RequestBody java.util.Map<String, String> payload,
            HttpServletRequest request){
    	
    	Product product = null;
    	User user = null;
    	
    	try {
    		product = productRepository.findById(productId).orElse(null);
    	} catch (Exception e) {
    		System.err.println("Error fetching product: " + e.getMessage());
    	}
    	
    	try {
    		user = userRepository.findById(userId).orElse(null);
    	} catch (Exception e) {
    		System.err.println("Error fetching user: " + e.getMessage());
    	}
    	
		if(product != null && user != null) {
			try {
				int rating = Integer.parseInt(payload.getOrDefault("rating", "5"));
				String comment = payload.get("comment");
				String imageUrl = payload.get("imageUrl");

				Recommendation recommendation = new Recommendation();
				recommendation.setProduct(product);
				recommendation.setUser(user);
				recommendation.setRating(rating);
				recommendation.setComment(comment);
				recommendation.setImageUrl(imageUrl);
				recommendationService.saveRecommendation(recommendation);
				return new ResponseEntity<Recommendation>(
						recommendation,
						headerGenerator.getHeadersForSuccessPostMethod(request, recommendation.getId()),
						HttpStatus.CREATED);
			}catch (Exception e) {
				e.printStackTrace();
				return new ResponseEntity<Recommendation>(
						headerGenerator.getHeadersForError(),
						HttpStatus.INTERNAL_SERVER_ERROR);
			}
		}
        return new ResponseEntity<Recommendation>(
        		headerGenerator.getHeadersForError(),
        		HttpStatus.BAD_REQUEST);
    }

    @DeleteMapping(value = "/recommendations/{id}")
    public ResponseEntity<Void> deleteRecommendations(@PathVariable("id") Long id){
    	Recommendation recommendation = recommendationService.getRecommendationById(id);
    	if(recommendation != null) {
    		try {
    			recommendationService.deleteRecommendation(id);
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
    	return new ResponseEntity<Void>(
    			headerGenerator.getHeadersForError(),
    			HttpStatus.NOT_FOUND);
    }
}
