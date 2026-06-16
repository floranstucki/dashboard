package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Email;

@Entity
@Table(name = "users")
public class User extends PanacheEntity {

    public String username;

    @Email
    @Column(unique = true)
    public String email;

    public String passwordHash;
}