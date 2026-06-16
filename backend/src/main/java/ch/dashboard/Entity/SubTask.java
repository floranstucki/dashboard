package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "sub_tasks")
public class SubTask extends PanacheEntity {

    @NotBlank
    public String title;

    public boolean done = false;

    @ManyToOne
    @JoinColumn(name = "task_id", nullable = false)
    public Task task;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}