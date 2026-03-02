package com.example.filter;

import java.util.Arrays;
import java.util.concurrent.atomic.AtomicInteger;

public class main {

    static class Solution {

        private static final String SUFFIX = " ...";

        public String solution(String message, int K) {
            if (message == null || message.isBlank()) return "...";
            if (message.length() <= K) return message;

            AtomicInteger len = new AtomicInteger(0);

            String joined = Arrays.stream(message.split("\\s+"))
                .takeWhile(word -> {
                    int next = len.get() + (len.get() > 0 ? 1 : 0) + word.length() + SUFFIX.length();
                    if (next > K) return false;
                    len.addAndGet((len.get() > 0 ? 1 : 0) + word.length());
                    return true;
                })
                .collect(java.util.stream.Collectors.joining(" "));

            return joined.isEmpty() ? "..." : joined + SUFFIX;
        }
    }
}
