package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "calendar_events")
public class CalendarEvent extends PanacheEntity {

    public String title;

    public String category;

    public String date;

    public String time;
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}