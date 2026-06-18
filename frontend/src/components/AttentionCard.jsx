import { AlertTriangle, CalendarDays, FolderKanban } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useCalendar } from "../context/CalendarContext";
import { useProjects } from "../context/ProjectsContext";

function AttentionCard() {
    const { tasks } = useTasks();
    const { sortedEvents } = useCalendar();
    const { projects } = useProjects();

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeEvents = Array.isArray(sortedEvents) ? sortedEvents : [];
    const safeProjects = Array.isArray(projects) ? projects : [];

    const today = new Date().toISOString().split("T")[0];

    const urgentTasks = safeTasks
        .filter((task) => task.status !== "Terminé")
        .filter((task) => task.priority === "Urgente" || task.priority === "Haute")
        .slice(0, 2);

    const todayEvents = safeEvents
        .filter((event) => event.date === today)
        .slice(0, 2);

    const lowProjects = safeProjects
        .filter((project) => Number(project.progress) < 50)
        .slice(0, 2);

    const alerts = [
        ...urgentTasks.map((task) => ({
            icon: AlertTriangle,
            title: task.title,
            detail: `${task.project} · ${task.priority}`,
            badge: "Important",
        })),
        ...todayEvents.map((event) => ({
            icon: CalendarDays,
            title: event.title,
            detail: `Aujourd’hui · ${event.time}`,
            badge: "Aujourd’hui",
        })),
        ...lowProjects.map((project) => ({
            icon: FolderKanban,
            title: project.name,
            detail: `Progression faible · ${project.progress}%`,
            badge: "Projet",
        })),
    ].slice(0, 5);

    return (
        <section className="dashboard-card attention-card">
            <div className="card-header">
                <h2>🔔 À surveiller</h2>
            </div>

            <div className="attention-list">
                {alerts.length > 0 ? (
                    alerts.map((alert, index) => {
                        const Icon = alert.icon;

                        return (
                            <article className="attention-item" key={index}>
                                <div className="attention-icon">
                                    <Icon size={18} />
                                </div>

                                <div>
                                    <h3>{alert.title}</h3>
                                    <p>{alert.detail}</p>
                                </div>

                                <span>{alert.badge}</span>
                            </article>
                        );
                    })
                ) : (
                    <p className="empty-state">Rien à surveiller pour le moment.</p>
                )}
            </div>
        </section>
    );
}

export default AttentionCard;