import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import { useCalendar } from "../context/CalendarContext";
import { useTasks } from "../context/TasksContext";
import { useGoals } from "../context/GoalsContext";

function WeekView() {
    const { sortedEvents } = useCalendar();
    const { tasks } = useTasks();
    const { goals } = useGoals();

    const today = new Date();

    const weekDays = Array.from({ length: 7 }, (_, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + index);

        const dateKey = date.toISOString().split("T")[0];

        return {
            label: date.toLocaleDateString("fr-CH", {
                weekday: "long",
                day: "2-digit",
                month: "2-digit",
            }),
            dateKey,
            events: sortedEvents.filter((event) => event.date === dateKey),
            tasks: tasks.filter((task) => task.deadline === dateKey),
        };
    });

    const urgentTasks = tasks.filter(
        (task) =>
            task.status !== "Terminé" &&
            (task.priority === "Urgente" || task.priority === "Haute")
    );

    const goalsToPush = goals.filter((goal) => Number(goal.progress) < 75);

    return (
        <AppLayout>
            <PageHeader
                title="Vue semaine"
                subtitle="Une vision claire des 7 prochains jours."
            />

            <section className="dashboard-card week-summary-card">
                <div className="card-header">
                    <h2>🔥 À pousser cette semaine</h2>
                </div>

                <div className="week-summary-grid">
                    <article>
                        <strong>{urgentTasks.length}</strong>
                        <span>Tâches importantes</span>
                    </article>

                    <article>
                        <strong>{goalsToPush.length}</strong>
                        <span>Objectifs à avancer</span>
                    </article>

                    <article>
                        <strong>{sortedEvents.slice(0, 7).length}</strong>
                        <span>Événements à venir</span>
                    </article>
                </div>
            </section>

            <section className="dashboard-card">
                <div className="card-header">
                    <h2>📅 Semaine</h2>
                </div>

                <div className="week-grid">
                    {weekDays.map((day) => (
                        <article className="week-day-card" key={day.dateKey}>
                            <h3>{day.label}</h3>

                            <div className="week-block">
                                <strong>Événements</strong>

                                {day.events.length > 0 ? (
                                    day.events.map((event) => (
                                        <p key={event.id}>
                                            {event.time} · {event.title}
                                        </p>
                                    ))
                                ) : (
                                    <span>Aucun événement</span>
                                )}
                            </div>

                            <div className="week-block">
                                <strong>Tâches</strong>

                                {day.tasks.length > 0 ? (
                                    day.tasks.map((task) => <p key={task.id}>{task.title}</p>)
                                ) : (
                                    <span>Aucune tâche</span>
                                )}
                            </div>
                        </article>
                    ))}
                </div>
            </section>
        </AppLayout>
    );
}

export default WeekView;