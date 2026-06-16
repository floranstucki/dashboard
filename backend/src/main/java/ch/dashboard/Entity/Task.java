package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "tasks")
public class Task extends PanacheEntity {

    public String title;

    public String project;

    public String priority;

    public String status;

    public String deadline;

    public String recurrence;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}