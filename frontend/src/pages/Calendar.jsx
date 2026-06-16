import { useState } from "react";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import { CalendarDays, Trash2 } from "lucide-react";
import { useCalendar } from "../context/CalendarContext";

function Calendar() {
    const {
        sortedEvents,
        eventsLoading,
        eventsError,
        addEvent,
        deleteEvent,
    } = useCalendar();

    const [title, setTitle] = useState("");
    const [category, setCategory] = useState("Projet");
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");

    const handleAddEvent = () => {
        if (!title.trim() || !date) return;

        addEvent({
            title: title.trim(),
            category,
            date,
            time: time || "Toute la journée",
        });

        setTitle("");
        setCategory("Projet");
        setDate("");
        setTime("");
    };

    return (
        <AppLayout>
            <PageHeader
                title="Calendrier"
                subtitle="Planifie tes événements importants et garde une vue globale."
            />

            <section className="dashboard-card calendar-form-card">
                <div className="card-header">
                    <h2>📅 Nouvel événement</h2>
                    <button onClick={handleAddEvent}>+ Ajouter</button>
                </div>

                <div className="calendar-form">
                    <input
                        type="text"
                        placeholder="Nom de l’événement..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddEvent();
                        }}
                    />

                    <select value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option>Projet</option>
                        <option>FinScope</option>
                        <option>Signal FC</option>
                        <option>Serveur</option>
                        <option>Emploi</option>
                        <option>Sport</option>
                        <option>Perso</option>
                    </select>

                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                    />

                    <input
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                    />
                </div>
            </section>

            <section className="dashboard-card calendar-list-card">
                <div className="card-header">
                    <h2>🗓️ Événements</h2>
                </div>

                <div className="calendar-list">
                    {eventsLoading && <p className="empty-state">Chargement des événements...</p>}

                    {eventsError && <p className="empty-state">{eventsError}</p>}

                    {!eventsLoading && !eventsError && sortedEvents.length === 0 && (
                        <p className="empty-state">Aucun événement prévu.</p>
                    )}

                    {sortedEvents.map((event) => (
                        <article className="calendar-item" key={event.id}>
                            <div className="calendar-icon">
                                <CalendarDays size={20} />
                            </div>

                            <div>
                                <h3>{event.title}</h3>

                                <div className="calendar-meta">
                                    <span>{event.category}</span>
                                    <span>{event.date}</span>
                                    <span>{event.time}</span>
                                </div>
                            </div>

                            <button onClick={() => deleteEvent(event.id)}>
                                <Trash2 size={17} />
                            </button>
                        </article>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}

export default Calendar;