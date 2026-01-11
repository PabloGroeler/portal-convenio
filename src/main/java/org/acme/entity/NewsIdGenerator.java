package org.acme.entity;

import jakarta.enterprise.context.ApplicationScoped;

import java.util.concurrent.atomic.AtomicLong;

@ApplicationScoped
public class NewsIdGenerator {

    private final AtomicLong counter = new AtomicLong(0);

    public long nextId() {
        return counter.incrementAndGet();
    }
}
