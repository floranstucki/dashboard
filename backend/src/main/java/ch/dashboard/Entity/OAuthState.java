package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "oauth_states")
public class OAuthState extends PanacheEntity {

    public String state;
    public Long userId;
    public Long expiresAt;
}