package org.acme.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "noticias")
public class News {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    @Column(name = "titulo")
    public String title;

    @Column(name = "conteudo", columnDefinition = "TEXT")
    public String content;

    public News() {
    }

    public News(Long id, String title, String content) {
        this.id = id;
        this.title = title;
        this.content = content;
    }
}
