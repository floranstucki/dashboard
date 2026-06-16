import { Sparkles } from "lucide-react";
import { useTasks } from "../context/TasksContext";
import { useProjects } from "../context/ProjectsContext";
import { useCalendar } from "../context/CalendarContext";
import { useGoals } from "../context/GoalsContext";

function AssistantCard() {
    const { tasks } = useTasks();
    const { projects } = useProjects();
    const { sortedEvents } = useCalendar();
    const { goals } = useGoals();

    const today = new Date().toISOString().split("T")[0];

    const activeTasks = tasks.filter((task) => task.status !== "Terminé");

    const overdueTasks = activeTasks.filter(
        (task) => task.deadline !== "Non définie" && task.deadline < today
    );

    const urgentTasks = activeTasks.filter(
        (task) => task.priority === "Urgente" || task.priority === "Haute"
    );

    const todayEvents = sortedEvents.filter((event) => event.date === today);

    const weakestProject = [...projects].sort(
        (a, b) => Number(a.progress) - Number(b.progress)
    )[0];

    const weakestGoal = [...goals].sort(
        (a, b) => Number(a.progress) - Number(b.progress)
    )[0];

    const nextAction =
        overdueTasks[0]?.title ||
        urgentTasks[0]?.title ||
        todayEvents[0]?.title ||
        weakestProject?.name ||
        "Planifier ta prochaine tâche importante";

    return (
        <section className="dashboard-card assistant-card">
            <div className="card-header">
                <h2>✨ Assistant personnel</h2>
            </div>

            <div className="assistant-content">
                <div className="smart-icon">
                    <Sparkles size={20} />
                </div>

                <div>
                    <p>
                        Tu as <strong>{activeTasks.length}</strong> tâches actives, dont{" "}
                        <strong>{urgentTasks.length}</strong> importantes.
                    </p>

                    <p>
                        Tâches en retard : <strong>{overdueTasks.length}</strong>.
                    </p>

                    {todayEvents.length > 0 && (
                        <p>
                            Aujourd’hui, tu as <strong>{todayEvents.length}</strong> événement(s)
                            prévu(s).
                        </p>
                    )}

                    {weakestProject && (
                        <p>
                            Projet à renforcer : <strong>{weakestProject.name}</strong>{" "}
                            ({weakestProject.progress}%).
                        </p>
                    )}

                    {weakestGoal && (
                        <p>
                            Objectif à avancer : <strong>{weakestGoal.title}</strong>{" "}
                            ({weakestGoal.progress}%).
                        </p>
                    )}

                    <p className="assistant-next-action">
                        Prochaine action recommandée : <strong>{nextAction}</strong>
                    </p>
                </div>
            </div>
        </section>
    );
}

export default AssistantCard;