import { CheckCircle2 } from "lucide-react";
import { useTasks } from "../context/TasksContext";

function FocusCard() {
    const { tasks, changeTaskStatus } = useTasks();

    const safeTasks = Array.isArray(tasks) ? tasks : [];
    const focusTasks = safeTasks
        .filter((task) => task.status !== "Terminé")
        .sort((a, b) => {
            const priorityOrder = {
                Urgente: 1,
                Haute: 2,
                Moyenne: 3,
                Basse: 4,
            };

            return priorityOrder[a.priority] - priorityOrder[b.priority];
        })
        .slice(0, 3);

    return (
        <section className="dashboard-card focus-card">
            <div className="card-header">
                <h2>🎯 Focus du jour</h2>
            </div>

            <div className="focus-list">
                {focusTasks.length > 0 ? (
                    focusTasks.map((task, index) => (
                        <article className="focus-item" key={task.id}>
                            <span className="focus-priority">{index + 1}</span>

                            <div>
                                <h3>{task.title}</h3>
                                <p>
                                    {task.project} · {task.priority} · {task.deadline}
                                </p>
                            </div>

                            <button onClick={() => changeTaskStatus(task.id)}>
                                <CheckCircle2 size={17} />
                            </button>
                        </article>
                    ))
                ) : (
                    <p className="empty-state">Aucune tâche active.</p>
                )}
            </div>
        </section>
    );
}

export default FocusCard;