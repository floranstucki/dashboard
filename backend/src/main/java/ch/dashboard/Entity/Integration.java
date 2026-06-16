package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "integrations")
public class Integration extends PanacheEntity {

    public String provider;

    @Lob
    public String accessToken;

    @Lob
    public String refreshToken;

    public Long expiresAt;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}