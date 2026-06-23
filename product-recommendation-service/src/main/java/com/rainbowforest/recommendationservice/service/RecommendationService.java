package com.rainbowforest.recommendationservice.service;

import com.rainbowforest.recommendationservice.model.Recommendation;
import java.util.List;

public interface RecommendationService {
	Recommendation getRecommendationById(Long recommendationId);
    Recommendation saveRecommendation(Recommendation recommendation);
    List<Recommendation> getAllRecommendationByProductName(String productName);
    List<Recommendation> getAllRecommendationByUserId(Long userId);
    void deleteRecommendation(Long id);
}
