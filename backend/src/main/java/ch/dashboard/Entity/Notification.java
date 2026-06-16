package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "notifications")
public class Notification extends PanacheEntity {
    public String title;
    public String message;
    @Column(name = "is_read")
    public boolean isRead = false;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}
