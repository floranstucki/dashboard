import { useMemo, useState } from "react";
import AppLayout from "../components/AppLayout";
import PageHeader from "../components/PageHeader";
import SubTasks from "../components/SubTasks";
import { CheckCircle2, Trash2 } from "lucide-react";
import { useTasks } from "../context/TasksContext";

function Tasks() {
    const {
        tasks,
        tasksLoading,
        tasksError,
        addTask,
        deleteTask,
        changeTaskStatus,
    } = useTasks();

    const [title, setTitle] = useState("");
    const [project, setProject] = useState("FinScope");
    const [priority, setPriority] = useState("Moyenne");
    const [deadline, setDeadline] = useState("");
    const [recurrence, setRecurrence] = useState("Aucune");

    const [filter, setFilter] = useState("Toutes");
    const [recurrenceFilter, setRecurrenceFilter] = useState("Toutes");

    const filteredTasks = useMemo(() => {
        return tasks.filter((task) => {
            const matchMainFilter =
                filter === "Toutes" ||
                task.project === filter ||
                task.priority === filter ||
                task.status === filter;

            const matchRecurrence =
                recurrenceFilter === "Toutes" ||
                (recurrenceFilter === "Récurrentes" &&
                    task.recurrence &&
                    task.recurrence !== "Aucune") ||
                (recurrenceFilter === "Non récurrentes" &&
                    (!task.recurrence || task.recurrence === "Aucune"));

            return matchMainFilter && matchRecurrence;
        });
    }, [tasks, filter, recurrenceFilter]);

    const handleAddTask = async () => {
        if (!title.trim()) return;

        await addTask({
            title: title.trim(),
            project,
            priority,
            deadline: deadline || "Non définie",
            recurrence,
        });

        setTitle("");
        setProject("FinScope");
        setPriority("Moyenne");
        setDeadline("");
        setRecurrence("Aucune");
    };

    return (
        <AppLayout>
            <PageHeader
                title="Tâches"
                subtitle="Ton backlog global, séparé du focus du jour."
            />

            <section className="dashboard-card tasks-form-card">
                <div className="card-header">
                    <h2>✅ Nouvelle tâche</h2>
                    <button onClick={handleAddTask}>+ Ajouter</button>
                </div>

                <div className="tasks-form">
                    <input
                        type="text"
                        placeholder="Nom de la tâche..."
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleAddTask();
                        }}
                    />

                    <select value={project} onChange={(e) => setProject(e.target.value)}>
                        <option>FinScope</option>
                        <option>Signal FC</option>
                        <option>Serveur</option>
                        <option>Emploi</option>
                        <option>Sport</option>
                        <option>Perso</option>
                    </select>

                    <select
                        value={priority}
                        onChange={(e) => setPriority(e.target.value)}
                    >
                        <option>Basse</option>
                        <option>Moyenne</option>
                        <option>Haute</option>
                        <option>Urgente</option>
                    </select>

                    <select
                        value={recurrence}
                        onChange={(e) => setRecurrence(e.target.value)}
                    >
                        <option>Aucune</option>
                        <option>Quotidienne</option>
                        <option>Hebdomadaire</option>
                        <option>Mensuelle</option>
                    </select>

                    <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                    />
                </div>
            </section>

            <section className="dashboard-card tasks-list-card">
                <div className="card-header">
                    <h2>📋 Backlog</h2>

                    <div className="tasks-filters">
                        <select
                            className="tasks-filter"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        >
                            <option>Toutes</option>
                            <option>FinScope</option>
                            <option>Signal FC</option>
                            <option>Serveur</option>
                            <option>Emploi</option>
                            <option>Sport</option>
                            <option>Perso</option>
                            <option>Basse</option>
                            <option>Moyenne</option>
                            <option>Haute</option>
                            <option>Urgente</option>
                            <option>À faire</option>
                            <option>En cours</option>
                            <option>Terminé</option>
                        </select>

                        <select
                            className="tasks-filter"
                            value={recurrenceFilter}
                            onChange={(e) => setRecurrenceFilter(e.target.value)}
                        >
                            <option>Toutes</option>
                            <option>Récurrentes</option>
                            <option>Non récurrentes</option>
                        </select>
                    </div>
                </div>

                <div className="tasks-list">
                    {tasksLoading && (
                        <p className="empty-state">Chargement des tâches...</p>
                    )}

                    {tasksError && (
                        <p className="empty-state">Erreur : {tasksError}</p>
                    )}

                    {!tasksLoading && !tasksError && filteredTasks.length === 0 && (
                        <p className="empty-state">Aucune tâche trouvée.</p>
                    )}

                    {!tasksLoading &&
                        !tasksError &&
                        filteredTasks.map((task) => (
                            <article
                                className={`task-item ${task.status === "Terminé" ? "task-done" : ""
                                    }`}
                                key={task.id}
                            >
                                <button
                                    className="task-check"
                                    onClick={() => changeTaskStatus(task.id)}
                                >
                                    <CheckCircle2 size={20} />
                                </button>

                                <div className="task-content">
                                    <h3>{task.title}</h3>

                                    <div className="task-meta">
                                        <span>{task.project}</span>
                                        <span>{task.priority}</span>
                                        <span>{task.deadline}</span>
                                        <span>{task.status}</span>
                                        <span>{task.recurrence || "Aucune"}</span>
                                    </div>

                                    <SubTasks taskId={task.id} />
                                </div>

                                <button
                                    className="task-delete"
                                    onClick={() => deleteTask(task.id)}
                                >
                                    <Trash2 size={17} />
                                </button>
                            </article>
                        ))}
                </div>
            </section>
        </AppLayout>
    );
}

export default Tasks;