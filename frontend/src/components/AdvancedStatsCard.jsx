import { AlertTriangle, BarChart3, Repeat, Target } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useGoals } from "../context/GoalsContext";
import { useProjects } from "../context/ProjectsContext";

function AdvancedStatsCard() {
    const { tasks } = useTasks();
    const { goals } = useGoals();
    const { projects } = useProjects();

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeGoals = Array.isArray(goals) ? goals : [];
    const safeProjects = Array.isArray(projects) ? projects : [];

    const completedTasks = safeTasks.filter((task) => task.status === "Terminé").length;
    const completionRate = safeTasks.length
        ? Math.round((completedTasks / safeTasks.length) * 100)
        : 0;

    const recurrentTasks = safeTasks.filter(
        (task) => task.recurrence && task.recurrence !== "Aucune"
    ).length;

    const almostGoals = safeGoals.filter(
        (goal) => Number(goal.progress) >= 80 && Number(goal.progress) < 100
    ).length;

    const weakProjects = safeProjects.filter(
        (project) => Number(project.progress) < 40
    ).length;

    const stats = [
        {
            icon: BarChart3,
            label: "Complétion tâches",
            value: `${completionRate}%`,
            detail: `${completedTasks}/${safeTasks.length} terminées`,
        },
        {
            icon: Repeat,
            label: "Tâches récurrentes",
            value: recurrentTasks,
            detail: "Actives dans le backlog",
        },
        {
            icon: Target,
            label: "Objectifs proches",
            value: almostGoals,
            detail: "Progression entre 80% et 99%",
        },
        {
            icon: AlertTriangle,
            label: "Projets faibles",
            value: weakProjects,
            detail: "Progression sous 40%",
        },
    ];

    return (
        <section className="dashboard-card advanced-stats-card">
            <div className="card-header">
                <h2>📈 Performance avancée</h2>
            </div>

            <div className="advanced-stats-grid">
                {stats.map((stat) => {
                    const Icon = stat.icon;

                    return (
                        <article className="advanced-stat-item" key={stat.label}>
                            <div className="advanced-stat-icon">
                                <Icon size={20} />
                            </div>

                            <div>
                                <span>{stat.label}</span>
                                <strong>{stat.value}</strong>
                                <p>{stat.detail}</p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default AdvancedStatsCard;