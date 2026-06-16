import { useMemo } from "react";
import { useCalendar } from "../context/CalendarContext";

function PlanningCard() {
    const { sortedEvents } = useCalendar();

    const weekDays = useMemo(() => {
        const today = new Date();

        return Array.from({ length: 7 }, (_, index) => {
            const currentDate = new Date(today);
            currentDate.setDate(today.getDate() + index);

            const dateKey = currentDate.toISOString().split("T")[0];

            return {
                day: currentDate.toLocaleDateString("fr-CH", {
                    weekday: "short",
                }),
                date: currentDate.toLocaleDateString("fr-CH", {
                    day: "2-digit",
                }),
                fullDate: dateKey,
                items: sortedEvents.filter((event) => event.date === dateKey),
            };
        });
    }, [sortedEvents]);

    return (
        <section className="dashboard-card planning-card">
            <div className="card-header">
                <h2>📅 Planning 7 jours</h2>
            </div>

            <div className="planning-grid">
                {weekDays.map((day) => (
                    <article className="planning-day" key={day.fullDate}>
                        <div className="planning-date">
                            <span>{day.day}</span>
                            <strong>{day.date}</strong>
                        </div>

                        <div className="planning-items">
                            {day.items.length > 0 ? (
                                day.items.map((event) => (
                                    <div className="planning-item" key={event.id}>
                                        <p>{event.time} · {event.title}</p>
                                    </div>
                                ))
                            ) : (
                                <p className="planning-empty">Aucun événement</p>
                            )}
                        </div>
                    </article>
                ))}
            </div>
        </section>
    );
}

export default PlanningCard;