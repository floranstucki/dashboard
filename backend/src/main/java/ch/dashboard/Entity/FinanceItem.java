package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;

@Entity
@Table(name = "finance_items")
public class FinanceItem extends PanacheEntity {

    @NotBlank
    public String description;

    @NotBlank
    public String type;

    @NotBlank
    public String category;

    @Min(0)
    public double amount;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}