package ch.dashboard.Entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;

@Entity
@Table(name = "daily_journal_entries")
public class DailyJournalEntry extends PanacheEntity {

    public String date;

    @Lob
    public String summary;

    public int tasksDone;
    public int habitsDone;
    public double sportKm;
    public boolean serverOk;
    public String weatherSummary;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
}