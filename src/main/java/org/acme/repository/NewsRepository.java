package org.acme.repository;

import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import org.acme.entity.News;

@ApplicationScoped
public class NewsRepository implements PanacheRepository<News> {
}
