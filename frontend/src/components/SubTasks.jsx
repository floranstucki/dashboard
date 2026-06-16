import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useTasks } from "../context/TasksContext";

function SubTasks({ taskId }) {
    const { fetchSubTasks, addSubTask, toggleSubTask, deleteSubTask } = useTasks();

    const [subTasks, setSubTasks] = useState([]);
    const [title, setTitle] = useState("");

    const completedCount = subTasks.filter((item) => item.done).length;

    const progress = useMemo(() => {
        if (subTasks.length === 0) return 0;
        return Math.round((completedCount / subTasks.length) * 100);
    }, [completedCount, subTasks.length]);

    const loadSubTasks = async () => {
        const data = await fetchSubTasks(taskId);
        setSubTasks(data);
    };

    useEffect(() => {
        loadSubTasks();
    }, [taskId]);

    const handleAdd = async () => {
        if (!title.trim()) return;

        const created = await addSubTask(taskId, title.trim());
        setSubTasks([created, ...subTasks]);
        setTitle("");
    };

    const handleToggle = async (subTaskId) => {
        const updated = await toggleSubTask(taskId, subTaskId);

        setSubTasks(
            subTasks.map((item) => (item.id === subTaskId ? updated : item))
        );
    };

    const handleDelete = async (subTaskId) => {
        await deleteSubTask(taskId, subTaskId);
        setSubTasks(subTasks.filter((item) => item.id !== subTaskId));
    };

    return (
        <div className="subtasks">
            <div className="subtasks-progress-info">
                <span>Sous-tâches</span>
                <strong>
                    {completedCount}/{subTasks.length} terminées · {progress}%
                </strong>
            </div>

            <div className="subtasks-progress">
                <div style={{ width: `${progress}%` }} />
            </div>

            {subTasks.length > 0 && progress === 100 && (
                <div className="subtasks-complete">
                    ✅ Toutes les sous-tâches sont terminées
                </div>
            )}
            <div className="subtasks-form">
                <input
                    type="text"
                    placeholder="Ajouter une sous-tâche..."
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleAdd();
                    }}
                />

                <button onClick={handleAdd}>
                    <Plus size={15} />
                </button>
            </div>

            <div className="subtasks-list">
                {subTasks.length > 0 ? (
                    subTasks.map((subTask) => (
                        <article
                            className={`subtask-item ${subTask.done ? "done" : ""}`}
                            key={subTask.id}
                        >
                            <button onClick={() => handleToggle(subTask.id)}>
                                <CheckCircle2 size={16} />
                            </button>

                            <span>{subTask.title}</span>

                            <button onClick={() => handleDelete(subTask.id)}>
                                <Trash2 size={15} />
                            </button>
                        </article>
                    ))
                ) : (
                    <p className="empty-state">Aucune sous-tâche.</p>
                )}
            </div>
        </div>
    );
}

export default SubTasks;