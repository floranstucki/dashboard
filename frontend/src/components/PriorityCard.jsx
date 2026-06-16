import { AlertTriangle, CalendarDays, Target } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useGoals } from "../context/GoalsContext";
import { useCalendar } from "../context/CalendarContext";

function PriorityCard() {
    const { tasks } = useTasks();
    const { goals } = useGoals();
    const { sortedEvents } = useCalendar();

    const today = new Date().toISOString().split("T")[0];

    const urgentTasks = tasks
        .filter((task) => task.status !== "Terminé")
        .filter((task) => task.priority === "Urgente" || task.priority === "Haute")
        .slice(0, 3);

    const todayEvents = sortedEvents
        .filter((event) => event.date === today)
        .slice(0, 2);

    const slowGoals = goals
        .filter((goal) => Number(goal.progress) < 50)
        .slice(0, 2);

    const priorities = [
        ...urgentTasks.map((task) => ({
            icon: AlertTriangle,
            title: task.title,
            detail: `${task.project} · ${task.priority}`,
        })),
        ...todayEvents.map((event) => ({
            icon: CalendarDays,
            title: event.title,
            detail: `Aujourd’hui · ${event.time}`,
        })),
        ...slowGoals.map((goal) => ({
            icon: Target,
            title: goal.title,
            detail: `${goal.category} · ${goal.progress}%`,
        })),
    ].slice(0, 5);

    return (
        <section className="dashboard-card priority-card">
            <div className="card-header">
                <h2>🎯 Priorités intelligentes</h2>
            </div>

            <div className="smart-list">
                {priorities.length > 0 ? (
                    priorities.map((item, index) => {
                        const Icon = item.icon;

                        return (
                            <article className="smart-item" key={index}>
                                <div className="smart-icon">
                                    <Icon size={18} />
                                </div>

                                <div>
                                    <h3>{item.title}</h3>
                                    <p>{item.detail}</p>
                                </div>
                            </article>
                        );
                    })
                ) : (
                    <p className="empty-state">Aucune priorité urgente.</p>
                )}
            </div>
        </section>
    );
}

export default PriorityCard;