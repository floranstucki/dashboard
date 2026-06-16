import { CalendarDays } from "lucide-react";
import { useCalendar } from "../context/CalendarContext";
import { Link } from "react-router-dom";
function UpcomingEventsCard() {
    const { sortedEvents } = useCalendar();

    const upcomingEvents = sortedEvents.slice(0, 3);

    return (
        <section className="dashboard-card upcoming-events-card">
            <div className="card-header">
                <h2>🗓️ Prochains événements</h2>

                <Link className="card-header-link" to="/calendar">
                    Voir tout
                </Link>
            </div>

            <div className="upcoming-events-list">
                {upcomingEvents.map((event) => (
                    <article className="upcoming-event-item" key={event.id}>
                        <div className="upcoming-event-icon">
                            <CalendarDays size={18} />
                        </div>

                        <div>
                            <h3>{event.title}</h3>

                            <div className="upcoming-event-meta">
                                <span>{event.category}</span>
                                <span>{event.date}</span>
                                <span>{event.time}</span>
                            </div>
                        </div>
                    </article>
                ))}

                {upcomingEvents.length === 0 && (
                    <p className="empty-state">Aucun événement prévu.</p>
                )}
            </div>
        </section>
    );
}

export default UpcomingEventsCard;