package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "habits")
public class Habit extends PanacheEntity {

    public String title;
    public String frequency;
    public boolean doneToday = false;
    public int streak = 0;
    public int bestStreak = 0;
    public int completedCount = 0;
    public int totalCheckCount = 0;
    public String lastDoneDate;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}