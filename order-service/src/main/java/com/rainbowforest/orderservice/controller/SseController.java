package com.rainbowforest.orderservice.controller;

import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.http.MediaType;
import java.io.IOException;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Map;
import java.util.List;
import java.util.ArrayList;
import com.rainbowforest.orderservice.domain.Order;

@RestController
@CrossOrigin(origins = "*")
public class SseController {

    private static final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    @GetMapping(value = "/order-stream/user/{userId}", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter subscribe(@PathVariable("userId") Long userId) {
        SseEmitter emitter = new SseEmitter(24 * 60 * 60 * 1000L); // 24 hours
        emitters.computeIfAbsent(userId, k -> new ArrayList<>()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(userId, emitter));
        emitter.onTimeout(() -> removeEmitter(userId, emitter));
        emitter.onError((e) -> removeEmitter(userId, emitter));

        try {
            emitter.send(SseEmitter.event().name("INIT").data("Connected"));
        } catch (IOException e) {
            removeEmitter(userId, emitter);
        }

        return emitter;
    }

    private void removeEmitter(Long userId, SseEmitter emitter) {
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters != null) {
            userEmitters.remove(emitter);
            if (userEmitters.isEmpty()) {
                emitters.remove(userId);
            }
        }
    }

    public void broadcastOrderUpdate(Order order) {
        if (order == null || order.getUser() == null) return;
        Long userId = order.getUser().getId();
        List<SseEmitter> userEmitters = emitters.get(userId);
        if (userEmitters != null) {
            List<SseEmitter> deadEmitters = new ArrayList<>();
            for (SseEmitter emitter : userEmitters) {
                try {
                    emitter.send(SseEmitter.event().name("ORDER_UPDATE").data(order));
                } catch (IOException e) {
                    deadEmitters.add(emitter);
                }
            }
            for (SseEmitter emitter : deadEmitters) {
                removeEmitter(userId, emitter);
            }
        }
    }
}
