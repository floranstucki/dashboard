package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "notes")
public class Note extends PanacheEntity {

    public String title;

    public String tag;

    @Column(length = 5000)
    public String content;

    public String createdAt;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}