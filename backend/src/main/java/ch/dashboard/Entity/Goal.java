package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

@Entity
@Table(name = "goals")
public class Goal extends PanacheEntity {
    public String title;
    public String category;

    public String deadline;

    @Min(0)
    @Max(100)
    public int progress;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}