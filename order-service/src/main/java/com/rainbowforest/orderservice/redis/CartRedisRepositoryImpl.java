package com.rainbowforest.orderservice.redis;

import com.fasterxml.jackson.core.JsonParseException;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonMappingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.stereotype.Repository;
import redis.clients.jedis.Jedis;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Repository
public class CartRedisRepositoryImpl implements CartRedisRepository{

    private ObjectMapper objectMapper = new ObjectMapper();
    private Jedis jedis = new Jedis();
    private final Map<String, Set<String>> fallbackCarts = new ConcurrentHashMap<>();

    @Override
    public void addItemToCart(String key, Object item) {
        try {
            String jsonObject = objectMapper.writeValueAsString(item);
            try {
                jedis.sadd(key, jsonObject);
            } catch (RuntimeException redisUnavailable) {
                fallbackCarts.computeIfAbsent(key, ignored -> ConcurrentHashMap.newKeySet()).add(jsonObject);
            }

        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    @Override
    public Collection<Object> getCart(String key, Class type) {
        Collection<Object> cart = new ArrayList<>();
        Collection<String> members;
        try {
            members = jedis.smembers(key);
        } catch (RuntimeException redisUnavailable) {
            members = fallbackCarts.getOrDefault(key, Set.of());
        }
        for (String smember : members) {
            try {
                cart.add(objectMapper.readValue(smember, type));
            } catch (JsonParseException e) {
                e.printStackTrace();
            } catch (JsonMappingException e) {
                e.printStackTrace();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        return cart;
    }

    @Override
    public void deleteItemFromCart(String key, Object item) {
        try {
            String itemCart = objectMapper.writeValueAsString(item);
            try {
                jedis.srem(key, itemCart);
            } catch (RuntimeException redisUnavailable) {
                Set<String> cart = fallbackCarts.get(key);
                if (cart != null) {
                    cart.remove(itemCart);
                }
            }
        } catch (JsonProcessingException e) {
            e.printStackTrace();
        }
    }

    @Override
    public void deleteCart(String key) {
        try {
            jedis.del(key);
        } catch (RuntimeException redisUnavailable) {
            fallbackCarts.remove(key);
        }
    }
}
