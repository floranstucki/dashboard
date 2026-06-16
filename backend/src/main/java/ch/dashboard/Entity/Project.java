package ch.dashboard.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import io.quarkus.hibernate.orm.panache.PanacheEntity;

@Entity
@Table(name = "projects")
public class Project extends PanacheEntity {

    public String name;

    public String status;

    @Min(0)
    @Max(100)
    public int progress;

    public String description;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

}