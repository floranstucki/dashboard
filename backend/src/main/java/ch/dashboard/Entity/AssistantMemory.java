package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "assistant_memories")
public class AssistantMemory extends PanacheEntity {

    public String memoryKey;

    @Lob
    public String memoryValue;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}