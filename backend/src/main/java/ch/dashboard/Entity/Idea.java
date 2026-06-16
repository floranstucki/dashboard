package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "ideas")
public class Idea extends PanacheEntity {

    public String title;

    public String category;

    @Column(length = 5000)
    public String content;

    public String status;

    public String createdAt;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}