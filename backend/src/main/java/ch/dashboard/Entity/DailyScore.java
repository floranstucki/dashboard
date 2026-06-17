package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "daily_scores")
public class DailyScore extends PanacheEntity {

    public String date;
    public int score;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}