package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "assistant_history")
public class AssistantHistory extends PanacheEntity {

    @Lob
    public String commandText;

    @Lob
    public String responseText;

    public String intent;

    public LocalDateTime createdAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}