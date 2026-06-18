import {
    Activity,
    CalendarDays,
    FolderKanban,
    PiggyBank,
    Target,
    Wallet,
} from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useProjects } from "../context/ProjectsContext";
import { useGoals } from "../context/GoalsContext";
import { useFinances } from "../context/FinancesContext";
import { useCalendar } from "../context/CalendarContext";

function MetricsCard() {
    const { tasks } = useTasks();
    const { projects } = useProjects();
    const { goals } = useGoals();
    const { items, totals, soldeNet, formatCHF } = useFinances();
    const { sortedEvents } = useCalendar();
    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const safeProjects = Array.isArray(projects) ? projects : [];
    const safeGoals = Array.isArray(goals) ? goals : [];
    const safeEvents = Array.isArray(sortedEvents) ? sortedEvents : [];
    const safeItems = Array.isArray(items) ? items : [];



    const openTasks = safeTasks.filter((task) => task.status !== "Terminé").length;

    const completedTasks = safeTasks.filter(
        (task) => task.status === "Terminé"
    ).length;

    const activeProjects = safeProjects.filter(
        (project) => project.status !== "Terminé"
    ).length;

    const averageProjectProgress = safeProjects.length
        ? Math.round(
            safeProjects.reduce(
                (sum, project) => sum + Number(project.progress),
                0
            ) / safeProjects.length
        )
        : 0;

    const averageGoalProgress = safeGoals.length
        ? Math.round(
            safeGoals.reduce((sum, goal) => sum + Number(goal.progress), 0) /
            safeGoals.length
        )
        : 0;

    const today = new Date().toISOString().split("T")[0];

    const todayEvents = safeEvents.filter(
        (event) => event.date === today
    ).length;

    const metrics = [
        {
            icon: Activity,
            label: "Tâches ouvertes",
            value: openTasks,
            detail: `${completedTasks} terminée(s)`,
        },
        {
            icon: FolderKanban,
            label: "Projets actifs",
            value: activeProjects,
            detail: `${averageProjectProgress}% progression moyenne`,
        },
        {
            icon: Target,
            label: "Objectifs",
            value: safeGoals.length,
            detail: `${averageGoalProgress}% progression moyenne`,
        },
        {
            icon: CalendarDays,
            label: "Aujourd’hui",
            value: todayEvents,
            detail: "Événement(s) prévu(s)",
        },
        {
            icon: PiggyBank,
            label: "Épargne",
            value: formatCHF(totals.epargne),
            detail: `${safeItems.length} ligne(s) financière(s)`,
        },
        {
            icon: Wallet,
            label: "Solde net",
            value: formatCHF(soldeNet),
            detail: `Revenus : ${formatCHF(totals.revenus)}`,
        },
    ];

    return (
        <section className="dashboard-card metrics-card">
            <div className="card-header">
                <h2>📊 Métriques personnelles</h2>
            </div>

            <div className="metrics-grid">
                {metrics.map((metric) => {
                    const Icon = metric.icon;

                    return (
                        <article className="metric-item" key={metric.label}>
                            <div className="metric-icon">
                                <Icon size={20} />
                            </div>

                            <div>
                                <span>{metric.label}</span>
                                <strong>{metric.value}</strong>
                                <p>{metric.detail}</p>
                            </div>
                        </article>
                    );
                })}
            </div>
        </section>
    );
}

export default MetricsCard;